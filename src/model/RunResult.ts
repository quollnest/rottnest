import {CGHashResult, CUHashHex, CGResult, CGStatus, CGVisualResult, CUResultKind,
	CUResultMixed} from "./CallGraph";

export type RunResultKind = "CUIDObj" | "CUIDTotal" | "CUIDEndComp" | "VolumeWithHash" | 
	"CacheHashOnly" | "StatusItem" | "VisualResult" | "Invalid";

/*
 * Used to hold and decipher run result data
 * that is sent to the frontend from the backend
 */
export class RunResultBuffer {

	withCUID: Map<string, Array<CGResult>> = new Map();
	withTotal: Array<CGResult> = []

	cacheHashes: Set<CUHashHex> = new Set();
	volumesWithHashes: Map<string, Array<CGHashResult>> = new Map();
	statusItems: Set<CGStatus> = new Set();

	volumeSet: Array<CUResultMixed> = [];

	runsRequested: Set<string> = new Set();
	runsFinished: Set<string> = new Set();
	runResults: Map<string, CGVisualResult> = new Map();

	endComps: Array<CGResult> = [];

	reset() {
		this.withCUID = new Map();
		this.withTotal = []
		this.cacheHashes = new Set();	
		this.volumesWithHashes = new Map();
		this.statusItems = new Set();
		this.runsRequested = new Set();
		this.runsFinished = new Set();
		this.runResults = new Map();
		this.volumeSet = [];
	}

	requestRun(gid: string) {
		this.runsRequested.add(gid);
	}

	markFinished(gid: string) {
		this.runsFinished.add(gid);
	}

	checkIfRequested(gid: string) {
		return this.runsRequested.has(gid);
	}

	checkIfFinished(gid: string) {
		return this.runsFinished.has(gid);
	}

	isVisualResult(jsonObj: any) {
		const stateCompl = jsonObj.status === 'complete';
		const visObj = jsonObj.vis_obj !== null
			&& jsonObj.vis_obj !== undefined;
		return stateCompl && visObj;
	}

	isStatusItem(jsonObj: any) {
		const notCUID = !this.isCUIDObj(jsonObj);

		const has1Key = Object.keys(jsonObj).length === 1;
		const keyIsStatus = jsonObj.status !== undefined;
		return notCUID && keyIsStatus && has1Key; 
	}

	isCUIDObj(jsonObj: any): boolean {
		return jsonObj.cu_id !== undefined;
	}

	isCUIDTotal(jsonObj: any): boolean {
		const isCUIDObjRes = this.isCUIDObj(jsonObj);
		return isCUIDObjRes && jsonObj.cu_id === 'TOTAL';
	}

	isCUIDEndComp(jsonObj: any): boolean {

		const isCUIDObjRes = this.isCUIDObj(jsonObj);
		return isCUIDObjRes && jsonObj.cu_id === 'endcomp';
	}

	getEndComp(): Array<CGResult> {
		return this.endComps;
	}

	
	isHashVolumes(jsonObj: any): boolean {
		const noCUID = !this.isCUIDObj(jsonObj);
		const hasTSource = jsonObj.t_source !== undefined;
		const hasVolumes = jsonObj.volumes !== undefined;
		const hasTocks = jsonObj.tocks !== undefined;
		return noCUID && hasTocks && hasTSource && hasVolumes;
	}

	isCacheHashOnly(jsonObj: any): boolean {
		
		const noCUID = !this.isCUIDObj(jsonObj);
		const hasVolumes = jsonObj.volumes !== undefined;
		const keyIsCache = jsonObj.cache_hash_hex !== undefined;
		return noCUID && hasVolumes && keyIsCache;
	}

	decodeAndSort(jsonObj: any): [RunResultKind, any] {
		//We need to make a decision aboututhem
		let msgKind: RunResultKind = "Invalid";
		if(this.isVisualResult(jsonObj)) {
			msgKind = 'VisualResult';
			this.runResults.set(jsonObj.cu_id, jsonObj);
		} else if(this.isCUIDTotal(jsonObj)) {
			this.withTotal.push({
				volumes: jsonObj.volumes,
				tSource: jsonObj.t_source,
				tocks: jsonObj.tocks,
				cuID: jsonObj.cu_id,
				status: jsonObj.status,
				npQubits: jsonObj.np_qubits
			});
			msgKind = "CUIDTotal";
		} else if(this.isCUIDEndComp(jsonObj)) {
			msgKind = "CUIDEndComp";
			this.endComps.push({
				volumes: jsonObj.volumes,
				tSource: jsonObj.t_source,
				tocks: jsonObj.tocks,
				cuID: jsonObj.cu_id,
				status: jsonObj.status,
				npQubits: jsonObj.np_qubits
			});
		} else if(this.isCUIDObj(jsonObj)) {
			msgKind = "CUIDObj";
			const volData = {
					volumes: jsonObj.volumes,
					tSource: jsonObj.t_source,
					tocks: jsonObj.tocks,
					cuID: jsonObj.cu_id,
					status: jsonObj.status,
					npQubits: jsonObj.np_qubits
				}
			const volMixedData = {
					kind: "CUResultData" as CUResultKind,
					mxid: this.volumeSet.length,
					volumes: jsonObj.volumes,
					tSource: jsonObj.t_source,
					tocks: jsonObj.tocks,
					cuID: jsonObj.cu_id,
					status: jsonObj.status,
					npQubits: jsonObj.np_qubits
				}
			this.volumeSet.push(volMixedData);
			if(this.withCUID.has(jsonObj.cu_id)) {
				const volarray = this.withCUID
					.get(jsonObj.cu_id);

				if(volarray) {
					volarray.push(volData);
				}
			} else {
				const volarray: Array<CGResult> = [];

				volarray.push(volData);

				this.withCUID.set(jsonObj.cu_id,
							   volarray);
			}
		} else if(this.isHashVolumes(jsonObj)) {
			const volMixedData = {
					kind: "CUCacheData" as CUResultKind,
					mxid: this.volumeSet.length,
					volumes: jsonObj.volumes,
					tSource: jsonObj.t_source,
					tocks: jsonObj.tocks,
					cacheHash: jsonObj.cache_hash_hex
				}
			this.volumeSet.push(volMixedData);

			if(this.volumesWithHashes.has(jsonObj.cache_hash_hex)) {
				const volarray = this.volumesWithHashes
					.get(jsonObj.cache_hash_hex);
				if(volarray) {
					volarray.push({
						volumes: jsonObj.volumes,
						tSource: jsonObj.t_source,
						tocks: jsonObj.tocks,
						cacheHash: jsonObj.cache_hash_hex
					});
				}
			} else {
				const volarray = [];					
				volarray.push({
					volumes: jsonObj.volumes,
					tSource: jsonObj.t_source,
					tocks: jsonObj.tocks,
					cacheHash: jsonObj.cache_hash_hex
				});
				this.volumesWithHashes.set(jsonObj.cache_hash_hex,
							   volarray);
			}
			msgKind = "VolumeWithHash";
		} else if(this.isCacheHashOnly(jsonObj)) {
			this.cacheHashes.add({
				hashhex: jsonObj.cache_hash_hex
			});
			msgKind = "CacheHashOnly";
		} else if(this.isStatusItem(jsonObj)) {

			msgKind = "StatusItem";
			this.statusItems.add({
				status: jsonObj.status
			});
		} else {
			console.warn("Object received that did not match category");
			console.warn(JSON.stringify(jsonObj));
		}
		return [msgKind, jsonObj]	
	}

	getVolumeSet(): Array<CUResultMixed> {
		return this.volumeSet;
	}

	getCUIDMap(): Map<string, Array<CGResult>> {
		return this.withCUID;
	}

	getTotalArray(): Array<CGResult> {
		return this.withTotal;
	}

	getCacheHashesSet(): Set<CUHashHex> {
		return this.cacheHashes;
	}

	getVolHashMap(): Map<string, Array<CGHashResult>> {
		return this.volumesWithHashes;
	}


}
