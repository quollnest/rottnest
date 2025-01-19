
/**
 * Remote data type used
 * by the backend server
 *
 * May be extended/versioned
 */
export type SubKind = {
	name: string
}

export type RegionRouterKind = {
	name: string
}

export type RottnestRouterKindMap = {
	bus: Array<RegionRouterKind> 
	register: Array<RegionRouterKind>
	bellstate: Array<RegionRouterKind>	
	factory: Array<RegionRouterKind>	
	buffer: Array<RegionRouterKind>
}

/**
 * Singularised phrasing of kinds
 * that is given to the front end
 * by the backend
 */
export type RottnestKindMap = {
	bus: Array<SubKind>
	register: Array<SubKind>
	bellstate: Array<SubKind>
	factory: Array<SubKind>
	buffer: Array<SubKind>	
}

/**
 * Pluralised component that holds an
 * array for the mapping to other kinds.
 *
 * Used for finding connectivity between kinds
 */
export type RegionKindKeyMap = {
	bus: Array<keyof RegionKindKeyMap>	
	registers: Array<keyof RegionKindKeyMap>
	bellstates: Array<keyof RegionKindKeyMap>	
	factories: Array<keyof RegionKindKeyMap>
	buffers: Array<keyof RegionKindKeyMap>
	untagged: Array<keyof RegionKindKeyMap>
}

/**
 * This a region kind map kind that implies a kind
 * of directionality between types
 * This should be leveraged within the algorithm
 * to identify if a region can connect to another
 */
export const RegionKindMap: RegionKindKeyMap = {
	bus: ['registers', 'buffers', 'bus'], 
	registers: [],
	bellstates: ['bus'],	
	factories: ['bus', 'buffers'],
	buffers: ['bus'],
	untagged: [], 
}
