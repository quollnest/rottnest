
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
		id: 'd_d'
	}

}

export function CUVolumeDummy() {
	return {	
		REGISTER_VOLUME: 0,
		FACTORY_VOLUME: 0,
		ROUTING_VOLUME: 0, 
		T_IDLE_VOLUME: 0,
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

export function RottCallGraphDefault() {
	return {
		graph: new Map(),
	};
}
