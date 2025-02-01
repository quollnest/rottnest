
/**
 * We will assume that the data is a flat structure
 * with index links
 * I have opened it up to have fieldData that will
 * allow mapping for it
 */
export type RottGraphEntry = {
	cu_id: string
	id: string
	name: string
	description: string
	children: Array<string>
	compute_unit: boolean
}

export type CUVolume = {
	REGISTER_VOLUME: number
	FACTORY_VOLUME: number
	ROUTING_VOLUME: number
	T_IDLE_VOLUME: number
	BELL_IDLE_VOLUME: number
	BELL_ROUTING_VOLUME: number
	NON_PARTICIPATORY_VOLUME?: number
}

export type CUTocks = {
	graph_state: number
	bell: number
	t_schedule: number
	bell2: number
	total: number
}

export type CGResult = {	
	volumes: CUVolume
	tSource: CUSource
	tocks: CUTocks
	cuID: string
	status: string
	npQubits: number
}

export type CUResultKind = "CUResultData" | "CUCacheData";

export type CUResultMixed = {
	kind: CUResultKind
	mxid: number
	volumes: CUVolume
	tSource: CUSource
	tocks: CUTocks
	cuID?: number
	status?: string
	npQubits?: number
	cacheHash?: CUHashHex
}

export type CGVisualResult = {
	data: any	
}

export type CGStatus = {
	status: string
}

export type CGHashResult = {
	volumes: CUVolume
	tSource: CUSource
	tocks: CUTocks
	cacheHash: CUHashHex
}

export type CUHashHex = {
	hashhex: string
}

export type RottCallGraph = {
	graph: Map<string, RottGraphEntry>
}
export type CUSource = {
	[key: string]: number
}

export type CUReqResult = {
	
	cu_id: string
	status: string
	vis_obj: string | null
	volumes: CUVolume
	t_source: CUSource
}

export function RottCallGraphEntryDefault() {
	return {
		cu_id: '0..0', 
		description: 'No Description',
		children: [],
		compute_unit: false,
		id: 'd_d',
		name: '0..0'
	}

}

export function CUVolumeDummy() {
	return {	
		REGISTER_VOLUME: 0,
		FACTORY_VOLUME: 0,
		ROUTING_VOLUME: 0, 
		T_IDLE_VOLUME: 0,
		BELL_IDLE_VOLUME: 0, 
		BELL_ROUTING_VOLUME: 0,
		NON_PARTICIPATORY_VOLUME: 0
	}
}

export function CUReqResultDummy() {
	return {

		cu_id: 'invalid',
		status: '',
		vis_obj: null,
		volumes: CUVolumeDummy(),
		t_source: {}
	}
}

export function CUSourceDummy() {
	return {

	}
}

export function CUTocksDummy() {
	return {
		graph_state: 0, 
		bell: 0,
		t_schedule: 0,
		bell2: 0,
		total: 0,
	}
}

export function CGResultDummy(): CGResult {
	return {
		volumes: CUVolumeDummy(),
		tSource: CUSourceDummy(),
		tocks: CUTocksDummy(),
		visObj: null,
		status: 'Invalid',
		cuID: 'X_X',
		npQubits: 0,
	}
}

export function RottCallGraphDefault() {
	return {
		graph: new Map(),
	};
}
