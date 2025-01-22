
/**
 * RegionCell that has coordinates and direction
 * of connectivity
 */
export type RegionCell = {
	x: number
	y: number
	cdir?: number
	cnKind?: number
	manualSet?: boolean
}

/**
 * Dimensions of the region, since it is assumed
 * that they are rectangular, we just need to
 * record the top-left point and the
 * width and height
 */
export type RegionDimension = {
	x: number
	y: number
	width: number
	height: number
}

/**
 * Returns the cell and the toolkind recorded
 * Used by the RegionDataList object
 */
export type RegionCellAggr = {
	toolKind: number
	visible: boolean
	cell: RegionCell | null
}
	


/**
 * This output segment provides data to
 * help check cells in each direction and what would
 * be suitable
 */
export type RegionOutputSegment = {
	cells: Array<Array<RegionCell>>
	dirToChecks: Array<Array<number>>
	kind: string 
	edgeCase: boolean
}

/**
 * A flattened version used by RegionData,
 * Used for saving to json and also
 * sending over a network.
 */
export type FlatRegionData = {
	regionKind: string
	subTypeKind: string
	cells: Array<[string, RegionCell]>
	connectionSet: boolean
	connectionToKind: string | null
	connectionToIdx: number | null
	connectionDir: number
	routerKind: string | null
}

/**
 * Used as part of AABB detection
 * within pathing/traversal/recommendations
 * of connections within the space.
 */
export type RegionEdge = {
	x1: number 
	x2: number
	y1: number 
	y2: number
}

/**
 * Surrounding edge coordinates of a
 * region, used as part of AABB detection
 */
export type RegionDataEdges = {
	top: RegionEdge
	bottom: RegionEdge
	left: RegionEdge
	right: RegionEdge
}

/**
 * Different regions listed in this aggregate
 */
export type Regions = {
	bus: Array<RegionData>
	registers: Array<RegionData>
	bellstates: Array<RegionData>
	factories: Array<RegionData>
	buffers: Array<RegionData>
}


/**
 * A RegionNode is used in a seenlist
 * as part of a traversal, the parentRefs
 * and adjacentRefs are indexes to for elements
 * within the list itself
 */
export type RegionNode = {
	regionData: RegionData
	parentRefs: Array<number>
	adjacentRefs: Array<number>
	ownIdx: number | null
	dir: number
}

/**
 * A connection pair tuple, has the index
 * and kind
 */
type RegionConPair = {
	kind: string
	idx: number
}


/**
 * RegionData, this is the base type that holds
 * the sequence of cells within here
 */
export class RegionData {
	cells: Map<string, RegionCell> = new Map();
	manuallySetConnection: boolean = false;	

	connectionSet: boolean = false;
	connectionToKind: string | null = null;
	connectionToIdx: number | null = null;
	connectionDir: number = 0;

	regionKind: string | null = null;
	subTypeKind: string | null = null;
	routerKind: string | null = null;

	deadRegion: boolean = false;
	
	visible: boolean = true;
	
	static CellConnectionDirection = 
		["None", "Up", "Right", "Left", "Down"];  

	static fromFlatten(data: FlatRegionData): RegionData {
		const rdata = new RegionData();
		rdata.regionKind = data.regionKind;
		rdata.subTypeKind = data.subTypeKind;
		rdata.connectionToIdx = data.connectionToIdx;
		rdata.connectionToKind = data.connectionToKind;
		rdata.connectionSet = data.connectionSet;
		rdata.connectionDir = data.connectionDir;
		rdata.routerKind = data.routerKind;
		for(const [key, value] of data.cells) {
			rdata.cells.set(key, value);	
		}	

		return rdata;
	}

	setRouterKind(kind: string) {
		this.routerKind = kind;
	}

	getRouterKind() {
		return this.routerKind;
	}

	replaceWith(rep: RegionData) {
		this.cells = rep.cells;
		this.manuallySetConnection = rep
			.manuallySetConnection;
		this.connectionSet = rep.connectionSet;
		this.connectionToKind = rep.connectionToKind;
		this.connectionToIdx = rep.connectionToIdx;
		this.connectionDir = rep.connectionDir;

		this.regionKind = rep.regionKind;
		this.subTypeKind = rep.subTypeKind;
		this.deadRegion = rep.deadRegion;
		this.visible = rep.visible;
	}

	isDead(): boolean {
		return this.deadRegion;
	}

	isVisible(): boolean {
		return this.visible;
	}

	setVisbility(vis: boolean) {
		this.visible = vis;
	}

	markAsDead() {
		//TODO: Consider dropping memory hogs like cells
		//and other things
		this.cells = new Map(); //kills them
		this.deadRegion = true;
	}

	cloneData(): RegionData {
		let newCells: Map<string, RegionCell> = new Map();
		const regData = new RegionData();
		regData.manuallySetConnection = this
			.manuallySetConnection;
		
		regData.regionKind = this.regionKind;
		regData.subTypeKind = this.subTypeKind;

		regData.connectionSet = this.connectionSet;
		regData.connectionToKind = this.connectionToKind;
		regData.connectionToIdx = this.connectionToIdx;
		regData.connectionDir = this.connectionDir;
		regData.routerKind = this.routerKind;	
		regData.deadRegion = this.deadRegion;

		for(let [key, value] of this.cells) {
			//console.log(key);
			const rcell = value; 
			if(rcell) {
				newCells.set(key, 
				     { 
					     x: rcell.x, 
					     y: rcell.y,
					     cdir: rcell.cdir,
					     cnKind: rcell.cnKind,
					     manualSet: rcell.manualSet
				     } );
			}
		}
		regData.cells = newCells;

		return regData;
	}

	getConnectionDataPair(): RegionConPair | null {
		const pkind = this.connectionToKind;
		const pidx = this.connectionToIdx;
		if(pkind != null && pidx != null) {
			return {
				kind: RegionData.SingularKind(pkind),
				idx: pidx			
			}
		} else {
			return null;
		}
	}
	
	getPluralKind(): string {
		if(this.regionKind) {
			return RegionData
				.PluraliseKind(this.regionKind);

		} else {
			return 'NA';
		}
	}
	
	static GetDirectionStrings(): Array<string> {
		return RegionData.CellConnectionDirection;
	}

	static SingularKind(regKind: string): string {
		switch(regKind) {
			case 'bus':
				return 'bus'
			case 'registers':
				return 'register'
			case 'factories':
				return 'factory'
			case 'bellstates':
				return 'bellstate'
			case 'buffers':
				return 'buffer'
				
		}

		return regKind;
	}

	static PluraliseKind(regKind: string): string {

		switch(regKind) {
			case 'bus':
				return 'bus'
			case 'register':
				return 'registers'
			case 'factory':
				return 'factories'
			case 'bellstate':
				return 'bellstates'
			case 'buffer':
				return 'buffers'
				
		}

		return regKind;
	}

	getKind(): string {
		return this.regionKind !== null ? this.regionKind :
			'NoKind';
	}

	getSubKind(): string {
		return this.subTypeKind !== null ? this.subTypeKind :
			'NoKind';
	}

	setSubKind(kind: string) {
		this.subTypeKind = kind;
	}

	cmpRef(other: RegionData): boolean {
		return this === other;
	}

	shallowDuplicate(): RegionData {
		let regNew = new RegionData();
		regNew.cells = this.cells;
		regNew.regionKind = this.regionKind;
		regNew.manuallySetConnection = this
			.manuallySetConnection;
		regNew.connectionSet = this.connectionSet;
		regNew.connectionToKind = this.connectionToKind;
		regNew.connectionToIdx = this.connectionToIdx;
		regNew.connectionDir = this.connectionDir;
		regNew.subTypeKind = this.subTypeKind;
		
		return regNew;
	}

	flatten(): FlatRegionData {
		
		let flatMap: Array<[string, RegionCell]>= [];

		for(const [key, value] of this.cells) {
			flatMap.push([key, value]);
		}	

		return { 
			regionKind: 
				this.regionKind !== null ? 
				this.regionKind : 'NoKind',
			subTypeKind: this.subTypeKind !== null ?
				this.subTypeKind : 'NoKind',
			cells: flatMap,
			routerKind: this.routerKind,
			connectionToIdx: this.connectionToIdx,
			connectionToKind: this.connectionToKind,
			connectionSet: this.connectionSet,
			connectionDir: this.connectionDir,

		}
	}

	matchConnection(kind: string, idx: number) {
		return this.connectionToKind === kind &&
			this.connectionToIdx == idx;
	}

	checkAABB(regEdge: RegionEdge): boolean {
		for(const [_, cell] of this.cells) {
			const x = cell.x;
			const y = cell.y;

			if(x >= regEdge.x1 && x <= regEdge.x2
			   && y >= regEdge.y1 && y <= regEdge.y2) {
				
				return true;
			}

		}
		return false;
	}
	
	edgeAABBs(): RegionDataEdges {
		let minY = +Infinity;
		let maxY = -Infinity;
		let minX = +Infinity;
		let maxX = -Infinity;

		for(const [_, cell] of this.cells) {
			if(minY > cell.y) {
				minY = cell.y;
			}
			if(maxY < cell.y) {
				maxY = cell.y;
			}
			if(minX > cell.x) {
				minX = cell.x;
			}
			if(maxX < cell.x) {
				maxX = cell.x;
			}
		}
		//Above finds all the cells, we should track
		//these on insertion
		
		//Top -> minY -1, minY -1, minX, maxX
		//Bottom -> maxY+1, maxY+1, minX, maxX
		//Left -> minX-1, minX-1, minY, maxY
		//Right -> maxX+1, maxX+1, minY, maxY
		
		return {
			top: { x1: minX, x2: maxX, 
				y1: minY-1, y2: minY-1 },
			
			bottom: { x1: minX, x2: maxX, 
				y1: maxY+1, y2: maxY+1 },

			left: { x1: minX-1, x2: minX-1, 
				y1: minY, y2: maxY },

			right: { x1: maxX+1, x2: maxX+1, 
				y1: minY, y2: maxY },
		}

	}

	insert(cell: RegionCell) {
		//TODO: Dirty hack but I wanted sets
		//	and it requires primitives until
		//	JS/TS supports equality checking
		//	override on custom types
		const rcStr = `${cell.x} ${cell.y}`;
			
		this.cells.set(rcStr, cell);
	}

	hasCoord(x: number, y: number) {
		
		//TODO: Should have this done once instead of multiple
		//	times
		const coordKey = `${x} ${y}`;
		return this.cells.get(coordKey) != null;
	}

	isManuallySet() {
		return this.manuallySetConnection;
	}

	isConnectionSet() {
		return this.connectionSet;
	}

	updateManuallySet(isManual: boolean) {
		this.manuallySetConnection = isManual;
	}

	//TODO: Revise this method to set only cells required
	setDirectionOnCells(direction: number, encKind: number) {
		const outputSegment = this.getOutputCells();
		let markers: Array<RegionCell> = [];
		if(direction > 0) {
			for(let i = 0; i < outputSegment.cells
			    .length; i++) {
				const dset = outputSegment
				.dirToChecks[i]; 
				for(const d of dset) {		
					if(d === direction) {
						markers = outputSegment
						.cells[i];
					}
				}
			}

			console.log(direction, outputSegment, markers);	
			for(const c of markers) {
				c.cdir = direction;
				c.cnKind = encKind; 
				c.manualSet = true;
			}
		} else {
			//TODO: Reset but we should have clearer type
			//field information here
			for(const [_, c] of this.cells) {
				c.cdir = direction;
				c.cnKind = undefined; 
				c.manualSet = false;
			}
		}

	}

	setConnectionInformation(kind: string, idx: number, 
				dir: number) {
		this.connectionToKind = kind;
		this.connectionToIdx = idx;
		this.connectionDir = dir;
		this.connectionSet = true;

		//Should apply update to cells
	}
	resetConnection() {
		this.connectionToKind = null;
		this.connectionToIdx = null;
		this.connectionDir = 0;
		this.connectionSet = false;
		this.manuallySetConnection = false;
	}



	/**
	 * Version 2:
	 * 	Directionality doesn't really matter,
	 * 	we need multiple segments to be extracted
	 *
	 * 	Edge cases still need to be considered
	 *
	 * This gets a RegionOutputSegment, primarily, it focuses on
	 * 	* Top of Region
	 * 	* Edge case if 1xN segment
	 * 1. Iterates through all cells in the map
	 * 2. While iterating it maintains:
	 * 	List of the smallest Y valud
	 * 	Smallest Y valud
	 * 3. If a new smallest Y is discovered, the list is cleared
	 *
	 * TODO: Refine this solution, it is slow
	 *
	 */
	getOutputCells(): RegionOutputSegment {
		
		let minY = +Infinity;
		let maxY = -Infinity;
		let minX = +Infinity;
		let maxX = -Infinity;
		
		let aggr: Array<Array<RegionCell>> = [];
		let topCells: Array<RegionCell> = [];
		let leftCells: Array<RegionCell> = [];
		let rightCells: Array<RegionCell> = [];
		let bottomCells: Array<RegionCell> = [];
		
		let dirToChecks: Array<Array<number>> = [];
		let edgeCase = false;

		//1. Find small Y
		//	And largest Y, and smallest X
		//	and Largest X

		for(const [_, cell] of this.cells) {
			if(minY > cell.y) {
				minY = cell.y;
			}
			if(maxY < cell.y) {
				maxY = cell.y;
			}
			if(minX > cell.x) {
				minX = cell.x;
			}
			if(maxX < cell.x) {
				maxX = cell.x;
			}
		}

		//2. Collect all cells for the smallest Y
		for(const [_, cell] of this.cells) {
			const x = cell.x;
			const y = cell.y;

			if(y === minY) {
				topCells.push(cell);
			}
			if(y === maxY) {
				bottomCells.push(cell);
			}
			if(x === minX) {
				leftCells.push(cell);
			}
			if(x === maxX) {
				rightCells.push(cell);
			}
		}

		
		//Nx1
		if(minY === maxY) {
			aggr.push(topCells);
			dirToChecks.push([1, 2, 3, 4]);
		} 
		
		//1xN
		if(minX === maxX) {

			aggr.push(rightCells);
			dirToChecks.push([1, 2, 3, 4]);
		}
		
		//Regular case: NxN
		if(minY < maxY && minX < maxX) {
			aggr.push(topCells);
			dirToChecks.push([1]);
			
			aggr.push(bottomCells);
			dirToChecks.push([4]);
			
			aggr.push(rightCells);
			dirToChecks.push([2]);
			
			aggr.push(leftCells);
			dirToChecks.push([3]);
		}
		return {
			cells: aggr,
			dirToChecks,//0 top, 1 bottom, 
			kind: this.getKind(),			
			edgeCase
		}
	}
	
	getCell(x: number, y: number): RegionCell | null  {
		
		const rcStr = `${x} ${y}`;
		const r = this.cells.get(rcStr);
		if(r) { 
			return r; 
		} else {
			return null;
		}
		
	}

	/**
	 * TODO: Uses the map given to find the corners
	 * of the region and compute its 4 corners to resolve
	 * a rectangle
	 */
	getCorners() {
		let minY = +Infinity;
		let maxY = -Infinity;
		let minX = +Infinity;
		let maxX = -Infinity;
		for(const [_, cell] of this.cells) {
			if(minY > cell.y) {
				minY = cell.y;
			}
			if(maxY < cell.y) {
				maxY = cell.y;
				}
			if(minX > cell.x) {
				minX = cell.x;
			}
			if(maxX < cell.x) {
				maxX = cell.x;
			}
		}

		return [
			this.getCell(minX, minY),
			this.getCell(maxX, minY),
			this.getCell(maxX, maxY),
			this.getCell(minX, maxY),
			
		];
	}

	

	getDimensions(): RegionDimension {
		let minY = +Infinity;
		let maxY = -Infinity;
		let minX = +Infinity;
		let maxX = -Infinity;
		for(const [_, cell] of this.cells) {
			if(minY > cell.y) {
				minY = cell.y;
			}
			if(maxY < cell.y) {
				maxY = cell.y;
				}
			if(minX > cell.x) {
				minX = cell.x;
			}
			if(maxX < cell.x) {
				maxX = cell.x;
			}
		}

		return {
			x: minX,
			y: minY,
			width: maxX - minX + 1,
			height: maxY - minY + 1
		}
	}

	/**
	 *
	 * TODO: Checks to see if the region data is now invalid
	 * This involves checking to see if it is still rectangular
	 */
	isInvalid() {
		return false;
	}

	empty(): number {
		return this.cells.size;
	}

	keySet(): Set<string> {
		return new Set(this.cells.keys());
	}


	cleanupRegionData(toRemove: Set<string>): number {
		for(const k of toRemove) {
			this.cells.delete(k);
		}
		return this.cells.size;
	}
}
