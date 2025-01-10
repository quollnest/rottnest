import { Regions, FlatRegionData, RegionOutputSegment,
	RegionData, RegionCell, 
	RegionDataEdges, RegionEdge, 
	RegionCellAggr} from './RegionData.ts'
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
	factories: Array<keyof CellKindData>
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
	registers: [],
	bellstates: ['bus'],	
	factories: ['bus', 'buffers'],
	buffers: ['bus'],
	untagged: [], 
}

const CellOutputDir = ["None", "Up", "Right", "Left", "Down"];  


/**
 * This is for flattening the regions
 * as they are previously map data types that
 * JS/TS does not support via stringify
 */
export type FlatRegions = {
	bus: Array<FlatRegionData>
	registers: Array<FlatRegionData>
	bellstates: Array<FlatRegionData>
	factories: Array<FlatRegionData>
	buffers: Array<FlatRegionData>
}

export type TaggedRegionData = {
	tag: string
	regionData: RegionData
}

export class RegionDataList {
	regions: Regions = {
		bus: [],
		registers: [],
		bellstates: [],
		factories: [],
		buffers: []
	};



	retrieveByIdx(kind: string | null, idx: number): RegionData | null {
		if(kind) {
			const kindKey = kind as keyof Regions;
			const regCol = this.regions[kindKey];
			if(regCol) {
				const regData = regCol[idx];
				return regData;
			}
		}

		return null;
	}

	updateByIdx(kind: string | null, idx: number, 
		    regData: RegionData) {
		if(kind) {
			const kindKey = kind as keyof Regions;
			const regCol = this.regions[kindKey];
			if(regCol) {
				regCol[idx] = regData;
			}
		}
	}

	discoverFromEdges(edges: RegionDataEdges): Array<RegionData> {
		let regionsOnEdges: Array<RegionData> = [];
		
		

		for(const regkey in this.regions) {
			const regionsOfKind = 
				this.regions[regkey as keyof Regions];
			
			for(let rk = 0; rk < regionsOfKind.length; 
			    rk++) {
				const regionData = regionsOfKind[rk];
				const isFound = 
					regionData.checkAABB(
						edges.top) ||
					regionData.checkAABB(
						edges.bottom) ||
					regionData.checkAABB(
						edges.left) ||
					regionData.checkAABB(
						edges.right);

				if(isFound) {
					regionsOnEdges.push(
						regionData);
				}



			}

		}
		
		return regionsOnEdges
	}
	
	traverseFromRegisters() {

		let seenSet: Array<RegionData> = []; 
		if(this.hasRegisters()) {
			const registers = this.regions
				.registers[0];
			//TODO: Return seenset, should be
			// in 
			let queue: Array<RegionData> = [registers];
			seenSet.push(registers);
			//We should do a AABB check on edges
			while(queue.length > 0) {
				let region = queue.shift();
				if(region) {
					const regionAABBs = region
						.edgeAABBs();
					const reglist = 
					this.discoverFromEdges(
						regionAABBs);
				
					//TODO: Check to see
						//if it matches right
					for(const r of reglist) {
						if(!seenSet
						   .includes(r)) {
							
							seenSet.push(
								r);
							queue
							.unshift(r);
						}
					}

					
				}

				
			}
			



		}

		return seenSet;
	}

	hasRegisters() {
		return this.regions.registers.length > 0;
	}

	

	/**
	 * Attempts to form connectivity between outSegment 
	 * with regionData
	 * It it is within the directions specified and the 
	 */
	attemptToConnect(outSegment: Array<RegionCell>,
			 dirToChecks: Array<number>,
			 regionData: RegionData):
					[number, number, 
						RegionCell[]]{
		let offsets = [];

		let dirResult = 0;
		let mostCellsConnected = 0;
		let cellsConnected = 0;
		let cellMarkers = [];
		//1. Gets the current set of directions we need 
		//	to check
		//	we need to then get the current offsets
		for(let o of dirToChecks) {
			if(CellOutputDir[o] === 'Up') {
				offsets.push([0, -1, 1]);
			}
			if(CellOutputDir[o] === 'Left') {

				offsets.push([-1, 0, 3]);
			}
			if(CellOutputDir[o] === 'Right') {

				offsets.push([1, 0, 2]);
			}
			if(CellOutputDir[o] === 'Down') {

				offsets.push([0, 1, 4]);
			}
		}
		//2. Using the offsets and the cells, 
		//	we compare against
		//	the region cells
		for(let offsetCoordsKey in offsets) {

			let [offx, offy, dirIdx] = 
				offsets[offsetCoordsKey];
			let matchedOne = false;	
			cellsConnected = 0;
			for(let cll of outSegment) {
					
				const ox = cll.x + offx; 
				const oy = cll.y + offy;
				
				if(regionData.hasCoord(ox, oy)) {
					matchedOne = true;
					cellsConnected++;
					cellMarkers.push(cll);
				} 

			}
			
			//TODO: Eliminate the mark_all comment
			//and just have a mark-1 or mark-most
			//This should be parent only
			if(matchedOne) {
				if(mostCellsConnected < 
				   cellsConnected) {

					mostCellsConnected =
						cellsConnected;
					dirResult = dirIdx;
				}	
			}
		}
		
		return [mostCellsConnected, dirResult, cellMarkers];

	}

	/**
	 * Check to see if it is even viable, if it is isn't,
	 * we don't check, if it is then we attempt to connect
	 *
	 * TODO: Check to see if this works
	 */
	canConnectToKind(kind: string, otherKind: string): boolean {
		
		const srcKindSet = CellKindMap[kind as 
			keyof CellKindData];
		const check = (srcKindSet.includes(
			otherKind as keyof CellKindData));
		
		return check;
	}

	/**
	 * Gets the connect kind index for encoding/recording 
	 * it into the cells
	 * so it can be saved with this information
	 */
	getConnectKindIndex(kind: string, otherKind: string): number {
		
		const srcKindSet = CellKindMap[
			kind as keyof CellKindData];
		return srcKindSet.indexOf(
			otherKind as keyof CellKindData);
	}
	/**
	 * Will attempt to provide the best suggestion
	 * based on heuristics
	 */
	attemptConnections(outSegment: RegionOutputSegment,
			   regionData: RegionData, 
			   regionKind: string): boolean {
		//let computedConnections = [];
		if(regionData.isConnectionSet() ||
		  	outSegment.kind === regionKind) {
			return false;
		}
		let bestConnections = 0;
		let bestDir = 0;
		let bestMarkers: Array<RegionCell> = [];

		let encKind = this.getConnectKindIndex(outSegment
							.kind, 
						       regionKind);
		console.log(outSegment);
		for(let i = 0; i < outSegment.cells.length; i++) {
			const cellsSeg = outSegment.cells[i];
			const dirToCheck = outSegment.dirToChecks[i];
			const [m, dr, markers] = 
				this.attemptToConnect(cellsSeg, 
					      	dirToCheck,
						regionData);

			if(bestConnections < m) {
				bestConnections = m;
				bestDir = dr;
				bestMarkers = markers;
			}

		}
		
		if(bestConnections > 0) {
			for(const c of bestMarkers) {
				c.cdir = bestDir;
				c.cnKind = encKind;
				c.manualSet = false;
			}
			return true;
		}
		console.log(bestConnections, bestMarkers,
			    bestDir);
		return false;
	}

	/**
	 * Provides an auto-bind for the connectivity
	 * 
	 * If it can find	 it, it will generate it
	 * Otherwise it will leave it as untagged
	 *
	 * TODO: A bit of a slow solution but it should provide
	 * a solution unless manualSet has been specified
	 */
	resolveConnectionsForRegionByIndex(kind: keyof Regions, 
					   idx: number) {
		let regionCol = this.regions[kind][idx];

		if(regionCol && !regionCol.isManuallySet()) {
			
			let outSegment 
			= regionCol.getOutputCells(kind);
			//TODO: Specify for multiple segments
			for(const regkey in this.regions) {
				const regionsOfKind = this.regions[
					regkey as keyof Regions];
				if(this.canConnectToKind(
					outSegment.kind, regkey)) {

					for(let rk = 0; rk < 
					    regionsOfKind.length; 
					    rk++) {
						const regionData = 
						regionsOfKind[rk];
						if(regionCol !==
						   regionData) {
						const isSet =
						this
						.attemptConnections(
							outSegment, 
							regionData, 
							regkey);

						if(isSet) { 
					regionCol.
					setConnectionInformation
							(regkey, rk)

							return; 
							}
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

			for(let idx = 0; idx < regionsOfKind.length; 
			    idx++) {
			this
			.resolveConnectionsForRegionByIndex(regKey, 
							    idx);
			}

		}

	}

	//TODO: Define a proper type for the return
	getCellDataFromCoords(x: number, y: number): RegionCellAggr {

		let res: RegionCellAggr 
			= { toolKind: -1, cell: null };	
		const rcStr = `${x} ${y}`;
		const fRes = [
			this.regions.buffers.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.bus.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.factories.filter((c) => 
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
	
	getRegionDataFromCoords(x: number, y: number) {
		const kindList = ['buffer', 'bus', 'factory', 
			'bellstate', 'register'];
		const rcStr = `${x} ${y}`;
		const fRes = [
			this.regions.buffers.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.bus.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.factories.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.bellstates.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.registers.filter((c) => 
				c.cells.get(rcStr) != null),
		];
	
	
		let idx = fRes.findIndex((r) => r.length > 0);
		if(idx >= 0) {
			let regData = fRes[idx].find((rd, _) => rd.cells
						     .get(rcStr) !== null);
			let regDataIdx = fRes[idx].findIndex((rd, _) => rd
							     .cells.get(rcStr) !== null);
						     
			
			return {
				regData,
				kind: kindList[idx],
				kindIdx: idx,
				regIdx: regDataIdx
			}
		} else {
			return null;
		}
	}

	getTagFromCoords(x: number, y: number): number {
		
		const rcStr = `${x} ${y}`;
		const fRes = [
			this.regions.buffers.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.bus.filter((c) => 
				c.cells.get(rcStr) != null),
			this.regions.factories.filter((c) => 
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
			factories: [],
			buffers: []
		}
		
		regions.bus = this.regions.bus
			.map((rd) => rd.cloneData());
		regions.registers = this.regions.registers
			.map((rd) => rd.cloneData());
		regions.bellstates = this.regions.bellstates
			.map((rd) => rd.cloneData());
		regions.factories = this.regions.factories
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

	flattenWithTags(): Array<{kind: string, tag: string, idx: number, rdata: RegionData}> {
		const regs = this.regions;
		let flatArray = [];

		flatArray.push(...regs.bus.map((v, i) => 
			 { return {kind: 'bus', tag: `bus${i}`, rdata: v, idx: i} }));
		flatArray.push(...regs.registers.map((v, i) => 
			 { return {kind: 'register', tag: `registers${i}`, 
				 rdata: v, idx: i} }));
		flatArray.push(...regs.bellstates.map((v, i) => 
			 { return {kind: 'bellstate', tag: `bellstates${i}`, 
				 rdata: v, idx: i}}));
				 
		flatArray.push(...regs.factories.map((v, i) => 
			 { return {kind: 'factory', tag: `factories${i}`, 
				 rdata: v, idx: i} }));
		flatArray.push(...regs.buffers.map((v, i) => 
			 { return {kind: 'buffer', tag: `buffers${i}`, 
				 rdata: v, idx: i} }));

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
			factories: [],
			buffers: []
		};
		
		regions.bus = this.regions.bus
			.map((rd) => rd.flatten());
		regions.registers = this.regions.registers
			.map((rd) => rd.flatten());
		regions.bellstates = this.regions.bellstates
			.map((rd) => rd.flatten());
		regions.factories = this.regions.factories
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
			factories: [],
			buffers: []
		};
		
		regions.bus = fdata.bus
			.map((rd) => RegionData.fromFlatten(rd));
		regions.registers = fdata.registers
			.map((rd) => RegionData.fromFlatten(rd));
		regions.bellstates = fdata.bellstates
			.map((rd) => RegionData.fromFlatten(rd));
		regions.factories = fdata.factories
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

