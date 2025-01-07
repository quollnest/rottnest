
/**
 * Project Details,
 * contains simple information about the project/architecture
 * This will be used by the settings form/project setup
 */
export type ProjectDetails = {
	projectName: string
	author: string
	width: number
	height: number
	description: string	
}

export type CellKindData = {
	bus: Array<keyof CellKindData>	
	registers: Array<keyof CellKindData>
	bellstates: Array<keyof CellKindData>	
	tfactories: Array<keyof CellKindData>
	buffers: Array<keyof CellKindData>
	untagged: Array<keyof CellKindData>
}

/**
 * This a cell map kind that implies a kind
 * of directionality between types
 *
 * This should be leveraged within the algorithm
 */
const CellKindMap: CellKindData = {
	bus: ['registers', 'buffers', 'bus'], 
	registers: ['registers'],
	bellstates: ['bus'],	
	tfactories: ['bus', 'buffers'],
	buffers: ['bus', 'registers'],
	untagged: [], 
}

const CellOutputDir = ["None", "Up", "Right", "Left"];  


type RegionDimensions = {
	width: number
	height: number
}

/**
 * This output segment provides data to
 * help check cells in each direction and what would
 * be suitable
 */
type RegionOutputSegment = {
	cells: Array<RegionCell>
	dirToChecks: Array<number>
	kind: string 
	edgeCase: boolean
}

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
 * A flattened version used by RegionData
 */
export type FlatRegionData = {
	cells: Array<[string, RegionCell]>
}


/**
 * RegionData, this is the base type that holds
 * the sequence of cells within here
 */
export class RegionData {
	cells: Map<string, RegionCell> = new Map();
	

	static fromFlatten(data: FlatRegionData): RegionData {
		const rdata = new RegionData();
		
		for(const [key, value] of data.cells) {
			rdata.cells.set(key, value);	
		}	

		return rdata;
	}

	flatten(): FlatRegionData {
		
		let flatMap: Array<[string, RegionCell]>= [];

		for(const [key, value] of this.cells) {
			flatMap.push([key, value]);
		}	

		return { cells: flatMap }
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



	/**
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
		
		let seenX: Array<number> = [];		
		let seenY: Array<number> = [];
		let minY = +Infinity;
		
		let cells: Array<RegionCell> = [];
		let dirToChecks: Array<number> = [];
		let edgeCase = false;
		//1. Find small Y
		for(const[_, cell] of this.cells) {
			if(minY > cell.y) {
				minY = cell.y;
			}
		}

		//2. Collect all cells for the smallest Y
		for(const [_, cell] of this.cells) {
			const x = cell.x;
			const y = cell.y;

			if(!seenX.includes(x)) {
				seenX.push(x);
			}
			if(!seenY.includes(y)) {
				seenY.push(y);
			}
			if(y === minY) {
				cells.push(cell);
			}
		}

		//3a. Only check above		
		
		//3b. Check edge, if 1xN
		if(seenX.length === 1 && seenY.length > 1) {
			//3.a Find all Y
			let minX = seenX.sort()[0];
			cells = [];
			for(const [_, cell] of this.cells) {
				const x = cell.x;
				
				if(x === minX) {
					cells.push(cell);
				}
				
			}
			dirToChecks.push(2);
			dirToChecks.push(3);
			edgeCase = true;
		} else {
			dirToChecks.push(1);
		}

		//TODO: What about 1x1?
		return {
			cells,
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
 * This is for flattening the regions
 * as they are previously map data types that
 * JS/TS does not support via stringify
 */
export type FlatRegions = {
	bus: Array<FlatRegionData>
	registers: Array<FlatRegionData>
	bellstates: Array<FlatRegionData>
	tfactories: Array<FlatRegionData>
	buffers: Array<FlatRegionData>
}


export class RegionDataList {
	regions: Regions = {
		bus: [],
		registers: [],
		bellstates: [],
		tfactories: [],
		buffers: []
	};

	/**
	 * Attempts to form connectivity between outSegment with regionData
	 * It it is within the directions specified and the 
	 */
	attemptToConnect(outSegment: RegionOutputSegment, regionData: RegionData,
				kind: string) {
		let offsets = [];
		let encKind = this.getConnectKindIndex(outSegment.kind, 
						       kind);
		let cellsConnected = false;
		//1. Gets the current set of directions we need to check
		//	we need to then get the current offsets
		for(let o of outSegment.dirToChecks) {
			if(CellOutputDir[o] === 'Up') {
				offsets.push([0, -1, 1]);
			}
			if(CellOutputDir[o] === 'Left') {

				offsets.push([-1, 0, 3]);
			}
			if(CellOutputDir[o] === 'Right') {

				offsets.push([1, 0, 2]);
			}
		}
		//2. Using the offsets and the cells, we compare against
		//	the region cells
		for(let offsetCoordsKey in offsets) {

			let [offx, offy, dirIdx] = offsets[offsetCoordsKey];
			let matchAll = true;	
			for(let cll of outSegment.cells) {
				
				const ox = cll.x + offx; 
				const oy = cll.y + offy;
				
				
				if(!regionData.hasCoord(ox, oy)) {
					matchAll = false;
					break;
				} 

			}
			//Mark all cells in outputSegment which reference
			//	the original
			if(matchAll) {
				
				for(let cll of outSegment.cells) {
					cll.cdir = dirIdx;
					cll.manualSet = false;
					cll.cnKind = encKind;


				}

				cellsConnected = true;
			}
		}
		
		return cellsConnected;

	}

	/**
	 * Check to see if it is even viable, if it is isn't,
	 * we don't check, if it is then we attempt to connect
	 *
	 * TODO: Check to see if this works
	 */
	canConnectToKind(kind: string, otherKind: string): boolean {
		
		const srcKindSet = CellKindMap[kind as keyof CellKindData];
		const check = (srcKindSet.includes(otherKind as keyof CellKindData));
		
		return check;
	}

	/**
	 * Gets the connect kind index for encoding/recording it into the cells
	 * so it can be saved with this information
	 */
	getConnectKindIndex(kind: string, otherKind: string): number {
		
		const srcKindSet = CellKindMap[kind as keyof CellKindData];
		return srcKindSet.indexOf(otherKind as keyof CellKindData);
	}

	/**
	 * Provides an auto-bind for the connectivity
	 * 
	 * If it can find it, it will generate it
	 * Otherwise it will leave it as untagged
	 *
	 * TODO: A bit of a slow solution but it should provide
	 * a solution unless manualSet has been specified
	 */
	resolveConnectionsForRegionByIndex(kind: keyof Regions, idx: number) {
		let regionCol = this.regions[kind][idx];

		if(regionCol) {
			let outSegment = regionCol.getOutputCells(kind);
			console.log(outSegment);
			for(const regkey in this.regions) {
				const regionsOfKind = this.regions[
					regkey as keyof Regions];
				if(this.canConnectToKind(outSegment.kind, regkey)) {

					for(const rk in regionsOfKind) {
						const regionData = regionsOfKind[rk];

						if(this.attemptToConnect(outSegment, 
									regionData,
									regkey)) {

							//We are finished, return
							return;
						}
					}
				}
			}
		}
	}

	/**
	 * Attempts to resolve for all regions
	 * Will be used as a temporary measure
	 *
	 * TODO: Improve this solution and the interation
	 * that the user may have with this function and component
	 */
	resolveConnectionsForAll() {
		for(const rkeystr in this.regions) {
			const regKey = rkeystr as keyof Regions;
			const regionsOfKind = this.regions[regKey];

			for(let idx = 0; idx < regionsOfKind.length; idx++) {
				this.resolveConnectionsForRegionByIndex(regKey, idx)
			}

		}

	}

	//TODO: Define a proper type for the return
	getCellDataFromCoords(x: number, y: number): 
		{ 
			toolKind: number 
			cell: RegionCell | null 
		}
	{
		let res: { toolKind: number, cell: RegionCell | null } 
			= { toolKind: -1, cell: null };	
		const rcStr = `${x} ${y}`;
		const fRes = [
			this.regions.buffers.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.bus.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.tfactories.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.bellstates.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.registers.filter((c) => 
				c.cells.get(rcStr) != null),
		];
		//TODO: We need a more robust method to determine this
		//	This is gross

		let idx = fRes.findIndex((r) => r.length > 0);
		if(idx >= 0) {
			let cell = fRes[idx][0].cells.get(rcStr);
			if(cell) {
				res.cell = cell;
			}
		}
		res.toolKind = idx+1;
		
		return res;
	}

	getTagFromCoords(x: number, y: number): number {
		
		const rcStr = `${x} ${y}`;
		const fRes = [
			this.regions.buffers.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.bus.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.tfactories.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.bellstates.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.registers.filter((c) => 
				c.cells.get(rcStr) != null),
		];
		//TODO: We need a more robust method to determine this
		//	This is gross

		let idx = fRes.findIndex((r) => r.length > 0);
		

		return idx+1;
	}

	cloneRegions(): Regions {
		let regions: Regions = {
			bus: [],
			registers: [],
			bellstates: [],
			tfactories: [],
			buffers: []
		}
		
		regions.bus = this.regions.bus
			.map((rd) => rd.cloneData());
		regions.registers = this.regions.registers
			.map((rd) => rd.cloneData());
		regions.bellstates = this.regions.bellstates
			.map((rd) => rd.cloneData());
		regions.tfactories = this.regions.tfactories
			.map((rd) => rd.cloneData());
		regions.buffers = this.regions.buffers
			.map((rd) => rd.cloneData());
		
		return regions;
	}

	cloneList(): RegionDataList {
		let dlist = new RegionDataList();
		dlist.regions = this.cloneRegions();
		return dlist;
	}

	flattenWithTags(): Array<{tag: string, rdata: RegionData}> {
		const regs = this.regions;
		let flatArray = [];

		flatArray.push(...regs.bus.map((v, i) => 
			 { return {tag: `bus${i}`, rdata: v} }));
		flatArray.push(...regs.registers.map((v, i) => 
			 { return {tag: `registers${i}`, rdata: v} }));
		flatArray.push(...regs.bellstates.map((v, i) => 
			 { return {tag: `bellstates${i}`, 
				 rdata: v} }));
		flatArray.push(...regs.tfactories.map((v, i) => 
			 { return {tag: `tfactories${i}`, 
				 rdata: v} }));
		flatArray.push(...regs.buffers.map((v, i) => 
			 { return {tag: `buffers${i}`, rdata: v} }));

		return flatArray;
	}

	resolveIntersections(a: Set<string>, b: Set<string>): 
		Set<string> {
		return a.intersection(b);	
	}


	cleanupIntersections(data: RegionData) {
		const rset = data.keySet();
		for(const key in this.regions) {
			const dataToRemove = [];
			const kRegions = this.regions[
				key as keyof Regions];
			
			for(const rk in kRegions) {
				const eReg = kRegions[rk];

				let toRemove = this
					.resolveIntersections(rset, 
					eReg.keySet());
				const r = eReg.cleanupRegionData(
					toRemove);

				if(r <= 0) {
					dataToRemove
						.push(Number(rk));
				}

			}

			//Removes any region that has 
			//  no more cells mapped
			//from the array.
			//TODO: Check to see if sort is necessary
			
			dataToRemove.sort();			
			dataToRemove.reverse();
			for(const idx of dataToRemove) {
				kRegions.splice(idx, 1);
			}
		}
	}

	addData(data: RegionData, pkey: keyof Regions) {
		//Check for intersections, produces a keySet
		//That we will use to discover overlaps
		//not just in the same type but other types.
		//const rset = data.keySet();
			
		this.cleanupIntersections(data)		
		//Gets added
		//console.log(this.regions);
		this.regions[pkey].push(data);
	}

	flatten(): FlatRegions {
		let regions: FlatRegions = {
			bus: [],
			registers: [],
			bellstates: [],
			tfactories: [],
			buffers: []
		};
		
		regions.bus = this.regions.bus
			.map((rd) => rd.flatten());
		regions.registers = this.regions.registers
			.map((rd) => rd.flatten());
		regions.bellstates = this.regions.bellstates
			.map((rd) => rd.flatten());
		regions.tfactories = this.regions.tfactories
			.map((rd) => rd.flatten());
		regions.buffers = this.regions.buffers
			.map((rd) => rd.flatten());
		
		return regions;
	}

	static fromFlatten(fdata: FlatRegions): RegionDataList {
		let rDataList = new RegionDataList();

		let regions: Regions = {
			bus: [],
			registers: [],
			bellstates: [],
			tfactories: [],
			buffers: []
		};
		
		regions.bus = fdata.bus
			.map((rd) => RegionData.fromFlatten(rd));
		regions.registers = fdata.registers
			.map((rd) => RegionData.fromFlatten(rd));
		regions.bellstates = fdata.bellstates
			.map((rd) => RegionData.fromFlatten(rd));
		regions.tfactories = fdata.tfactories
			.map((rd) => RegionData.fromFlatten(rd));
		regions.buffers = fdata.buffers
			.map((rd) => RegionData.fromFlatten(rd));
	
		rDataList.regions = regions;

		return rDataList;
	}
}


export class RottnestProject {
	name: string = "";
	regions: Array<RegionData> = [];
}


export type ProjectDump = {
	project: ProjectDetails
	regions: FlatRegions
}

