

/**
 * The ToolItemSettings is an object that is loaded
 * via localstorage or update via settings
 * This object is really just a neat dictionary
 */
export class ToolItemSettings {
	


	constructor() {

	}

}

/**
 * The ToolItemCommon is a static class that will
 * 
 */
export class ToolItemCommon {
	
	private static settings: ToolItemSettings = new ToolItemSettings();

	private constructor() { }

	private static loadSettingsFromLocalStorage(): (null | ToolItemSettings) {
		return null;
	}

	public static getSettings(): ToolItemSettings {
		const tic = ToolItemCommon.loadSettingsFromLocalStorage();
		if(tic) {
			ToolItemCommon.settings = tic;
		}	
		return ToolItemCommon.settings;	
	}

	public static writeSettings(key: string, value: any): boolean {
		

		return false;
	}
}
