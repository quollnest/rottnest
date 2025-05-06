import { HelpBoxData } from './HelpContainer';

export type HelpJsonData = {
  	language: string;
  	version: string;
  	helpItems: HelpBoxData[];
};

class HelpService {
	private static helpData: Map<string, HelpBoxData[]> = new Map();
  
  	static async loadHelpData(languageCode: string = 'en'): Promise<HelpBoxData[]> {
		
		// Have we already loaded?
		if (this.helpData.has(languageCode)) {
			return this.helpData.get(languageCode) || [];
		}
	    
		try {
			// Get json file with languiage prefix
			// Will want to make this selectable later as part of the ui. 
			const response = await fetch(`/src/assets/help/${languageCode}_help.json`);
	      
			if (!response.ok) {
				// Fallback to en
				if (languageCode !== 'en') {
					console.warn(`Help file for language ${languageCode} not found, falling back to English`);
					const fallbackData = await this.loadHelpData('en');
					return fallbackData;
				}
		
				throw new Error(`Failed to load help data: ${response.statusText}`);
			}	
	      
			const jsonData: HelpJsonData = await response.json();
			this.helpData.set(languageCode, jsonData.helpItems);
	      
			return jsonData.helpItems;

		} catch (err) {
			console.error(`Error loading help data for language ${languageCode}:`, err);
	      
			// Empty array in the case we can't load things. 
			return [];
		}
	}
  
  	static async getHelpItem(itemId: string, languageCode: string = 'en'): Promise<HelpBoxData | null> {
    		try {
      			
			const helpItems = await this.loadHelpData(languageCode);
      			return helpItems.find(item => item.id === itemId) || null;

    		} catch (err) {
      			
			console.error(`Error getting help item ${itemId}:`, err);
      			return null;

    		}
  	}
}

export default HelpService;
