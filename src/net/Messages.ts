
import { RottnestKindMap, RottnestRouterKindMap } from '../model/RegionKindMap.ts'
import { TSchedData } from '../model/TSchedData.ts';
import { DeRott } from './Serialisation'

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

export type RouterAggr = {
	options: Array<string>
	default: number
}

export class RottRouterTypesMSG implements DeRott  {
	
	subtypes: RottnestKindMap;
	subtypeMap: Map<string, RouterAggr> = new Map();

	constructor(subtypes: RottnestKindMap) {
		this.subtypes = subtypes;
		this.translateSubtypes();
	}

	translateSubtypes() {
		
		for(const k in this.subtypes) {
			const key = k as keyof RottnestKindMap;
			const vCol = this.subtypes[key];
			
			for(const v of vCol) {
				this.subtypeMap
					.set(v.name
						.toLowerCase(), 
						{
							options: [],
							default: -1
						});
			}
		}
	}

	fromStr(_: string) { return null; }
	
	fuzzyMatch(ky: string): keyof RottnestRouterKindMap 
		| null {

		const fuzzies: Map<string, string> = new Map([]);

		if(fuzzies.has(ky)) {
			const r = fuzzies.get(ky); 
			return  r as keyof RottnestRouterKindMap;
		} else {
			return null;
		}
	}

	fromJSON(mdata: any) {

		const data = mdata['payload'];
		for(const k in data) {

			const key = k.toLowerCase();
			const rDefName = data[k].default;
			const rOptions = data[k].options;
			
			if(this.subtypeMap.has(key)) {

				for(const v of rOptions) {
					const rtrs = this
						.subtypeMap.get(key);

					if(rtrs) {
						rtrs.options
							.push(v);

						if(rDefName === v) {
							rtrs.default
							= v;
						}
					}
				}
			} else {
				console.error('Unable to '
					 + 'decode message');
			}

		}
		return this.subtypeMap;
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
			return r as keyof RottnestKindMap;
		} else {
			return null;
		}
	}

	fromJSON(mdata: any) {
		const data = mdata['subtypes'];
			for(const k in data) {
			const lowerK = k.toLowerCase();
			let lowerKey = 
			lowerK as keyof RottnestRouterKindMap;

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
