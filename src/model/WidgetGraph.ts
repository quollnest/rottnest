
/**
 * We will assume that the data is a flat structure
 * with index links
 * I have opened it up to have fieldData that will
 * allow mapping for it
 */
export type WGraphEntry = {
	cu_id: string
	description: string
	children: Array<number>
}


export type WidgetGraph = {
	graphIndex: number
	rootIndex: number
	graph: Array<WGraphEntry>

}

export type CUVolume = {
	REGISTER_VOLUME: number
	FACTORY_VOLUME: number
	ROUTING_VOLUME: number
	T_IDLE_VOLUME: number

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
		status: 'invalid',
		vis_obj: null,
		volumes: CUVolumeDummy(),
		t_source: {}
	}
}

export function WidgetGraphDefault() {
	return {
		graph: [],
		rootIndex: 0,
		graphIndex: -1
	};
}
