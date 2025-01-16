
import { DeRott } from './Serialisation'

import { RottnestKindMap } from '../model/KindMap.ts'
import {TSchedData} from '../model/TSchedData.ts';
//This is used to current convert between front and
//backend
//

//Normalisation via keys

export class RottArchMSG {
	
	tschedData: TSchedData;

	constructor(tsched: TSchedData) {
		this.tschedData = tsched;
	}

	toJsonStr(): string {
		return JSON.stringify({
			cmd: "use_arch",
			payload: this.tschedData,
		});
	}
}

export class RottRunResultMSG {

	archid: number;

	constructor(archid: number) {
		this.archid = archid;
	}

	toJsonStr(): string {
		return JSON.stringify({
			cmd: "run_result",
			payload: this.archid,
		});
	}
}


export class RottSubTypesMSG implements DeRott  {
	
	regionKinds: RottnestKindMap = {
		bus: [{ name: 'Not Selected' }],	
		register: [{ name: 'Not Selected'}],
		bellstate: [{ name: 'Not Selected'}],
		factory: [{ name: 'Not Selected'}],
		buffer: [{ name: 'Not Selected' }]		
	}
	
	//This is not used
	fromStr(_: string) {
		return null;
	}
	
	fuzzyMatch(ky: string): keyof RottnestKindMap | null {
		const fuzzies: Map<string, string> = new Map([
			['bell', 'bellstate']
		]);

		if(fuzzies.has(ky)) {
			const r = fuzzies.get(ky); 
			return  r as keyof RottnestKindMap;
		} else {
			return null;
		}
	}

	fromJSON(mdata: any) {
		const data = mdata['subtypes'];
			for(const k in data) {
			const lowerK = k.toLowerCase();
			let lowerKey = 
				lowerK as keyof RottnestKindMap
			if(!(lowerKey in this.regionKinds)) {
				const keyChk = this.fuzzyMatch(
					lowerK);
				if(keyChk === null) {
					console.log(lowerKey);
					console.error(
						"Unable to convert");

					return null;
				} else {
					lowerKey = keyChk;
				}
			}

			for(const v of data[k]) {
				this.regionKinds[lowerKey]
					.push({ name: v });
			}
		}

		return this;
	}
}
