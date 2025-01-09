

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
 * Returns the cell and the toolkind recorded
 * Used by the RegionDataList object
 */
export type RegionCellAggr = {
	toolKind: number
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
 * A flattened version used by RegionData
 */
export type FlatRegionData = {
	cells: Array<[string, RegionCell]>
}

export type RegionEdge = {
	x1: number 
	x2: number
	y1: number 
	y2: number
}

export type RegionDataEdges = {
	top: RegionEdge
	bottom: RegionEdge
	left: RegionEdge
	right: RegionEdge
}

/**
 *
 */
export type Regions = {
	bus: Array<RegionData>
	registers: Array<RegionData>
	bellstates: Array<RegionData>
	tfactories: Array<RegionData>
	buffers: Array<RegionData>
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

	subTypeKind: string | null = null;
	
	static fromFlatten(data: FlatRegionData): RegionData {
		const rdata = new RegionData();
		
		for(const [key, value] of data.cells) {
			rdata.cells.set(key, value);	
		}	

		return rdata;
	}

	cmpRef(other: RegionData): boolean {
		return this === other;
	}

	shallowDuplicate(): RegionData {
		let regNew = new RegionData();
		regNew.cells = this.cells;
		regNew.manuallySetConnection = this.manuallySetConnection;
		regNew.connectionSet = this.connectionSet;
		regNew.connectionToKind = this.connectionToKind;
		regNew.connectionToIdx = this.connectionToIdx;
		regNew.subTypeKind = this.subTypeKind;
		
		return regNew;
	}

	flatten(): FlatRegionData {
		
		let flatMap: Array<[string, RegionCell]>= [];

		for(const [key, value] of this.cells) {
			flatMap.push([key, value]);
		}	

		return { cells: flatMap }
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

	setConnectionInformation(kind: string, idx: number) {
		this.connectionToKind = kind;
		this.connectionToIdx = idx;
		this.connectionSet = true;
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
	getOutputCells(kind: keyof Regions): RegionOutputSegment {
		
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
			dirToChecks,
			kind,
			edgeCase
		}
	}

	/**
	 * TODO: Uses the map given to find the corners
	 * of the region and compute its 4 corners to resolve
	 * a rectangle
	 */
	getCorners() {
		return [];
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

	cloneData(): RegionData {
		let newCells: Map<string, RegionCell> = new Map();
		const regData = new RegionData();
		for(let [key, value] of this.cells) {
			//console.log(key);
			const rcell = value; 
			if(rcell) {
				newCells.set(key, 
				     { x: rcell.x, y: rcell.y } );
			}
		}
		regData.cells = newCells;

		return regData;
	}
}
