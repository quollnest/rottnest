
import { DeRott } from './Serialisation'

import { RottnestKindMap } from '../model/KindMap.ts'
//This is used to current convert between front and
//backend
//

//Normalisation via keys



export class RottSubTypesMSG implements DeRott  {
	
	regionKinds: RottnestKindMap = {
		bus: [{ name: 'test_bus' }],	
		register: [{ name: 'test_register'}],
		bellstate: [{ name: 'test_bellstate'}],
		factory: [{ name: 'test_factory'}],
		buffer: [{ name: 'test_buffer' }]
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

	fromJSON(data: any) {
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
