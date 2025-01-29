
/**
 * An individual node that will be used by the backend
 * tscheduler and other components
 */
export type TSchedDataNode = {
	region_type: string
	x: number
	y: number
	width: number
	height: number
	downstream: Array<TSchedDataNode>
	//Optional fields
	bell_rate?: number
	factory_type?: string
	incl_top?: boolean
	router_type?: string
}

/**
 * Root component that will have be sent over and contain
 * tree-structured data
 */
export type TSchedData = {
	width: number
	height: number
	regions: Array<TSchedDataNode>
}
