import {DeRott} from "./Serialisation";


export class AppServiceMessage {
	
	rawData: string = '';
	interpretedData: any | null = {};
	
	dataIsJson: boolean = false;
	receivedData: boolean = false;

	constructor(data?: string) {
		if(data) {
			this.rawData = data;
			this.receivedData = true;

		}
	}

	setData(data: string) {
		this.rawData = data;
	}

	parseData(): boolean {
		try {
			const data = JSON.parse(this.rawData);
			this.interpretedData = data;
			this.dataIsJson = true;
			return true;
		} catch {
			this.dataIsJson = false;
			return false;
		}
	}

	parseDataTo<T extends DeRott>(container: T): T | null {
		if(!this.interpretedData) {
			if(!this.parseData()) {
				return null;
			}
		}

		const gData = this.interpretedData;
		console.log(this.rawData);
		console.log(gData);
		const res = container.fromJSON(gData);

		return res;
	}

	isJSON(): boolean {
		return this.dataIsJson;	
	}

	hasRaw(): boolean {
		return this.receivedData;
	}

	getRaw(): string {
		return this.rawData;
	}

	getJSON(): any | null {
		if(!this.dataIsJson) {
			this.parseData();
		}
		return this.interpretedData;
	}

}
