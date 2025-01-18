
import { FreeRegionStack } from './FreeRegionStack'
import { Regions, FlatRegionData, RegionOutputSegment,
	RegionData, RegionCell, 
	RegionDataEdges, RegionNode, 
	RegionCellAggr} from './RegionData'

import { RegionKindKeyMap, RegionKindMap } from './RegionKindMap';

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

export class RegionDataList {
	regions: Regions = {
		bus: [],
		registers: [],
		bellstates: [],
		factories: [],
		buffers: []
	};
	
	freeStack: FreeRegionStack = new FreeRegionStack();
	
	
	
	/*/
	 * Requires pluralised strings when used
	 */
	retrieveByIdx(kind: string | null, idx: number): 
		RegionData | null {
		if(kind) {
			const kindKey = kind as keyof Regions;
			const regCol = this.regions[kindKey];
			if(regCol) {
				const regData = regCol[idx];
				return regData;
			} else {
				return null;
			}
		} else {
			console.error(
			"Unable to retrieve requested region",
				     kind, idx);
			let eRR = new Error();
			console.error(eRR.stack);
			return null;
		}
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

	discoverFromEdges(edges: RegionDataEdges): Array<RegionNode> {
		let regionsOnEdges: Array<RegionNode> = [];
		
		

		for(const regkey in this.regions) {
			const regionsOfKind = 
				this.regions[regkey as keyof Regions];
			
			for(let rk = 0; rk < regionsOfKind.length; 
			    rk++) {
				const regionData = regionsOfKind[rk];
				const isTop = regionData.checkAABB(
						edges.top);
				const isBottom = regionData.checkAABB(
						edges.bottom);	
				const isLeft = regionData.checkAABB(
						edges.left);
				const isRight = regionData.checkAABB(
						edges.right);
				let dir = 0;
				if(isTop) {
					dir = 1;
				}
				if(isBottom) {
					dir = 4;
				}
				if(isLeft) {
					dir = 3;
				}
				if(isRight) {
					dir = 2;
				}
				const isFound = isTop || isBottom 
					|| isLeft || isRight;

					regionData.checkAABB(
						edges.bottom) ||
					regionData.checkAABB(
						edges.left) ||
					regionData.checkAABB(
						edges.right);

				if(isFound) {
					regionsOnEdges.push({
						regionData,
						   parentRefs: [],
						   adjacentRefs: [],
						   ownIdx: rk,
						   dir
					});
				}



			}

		}
		
		return regionsOnEdges
	}
	
	
	/**
	 * Intent of this function is construct a list
	 * of regions (RegionData)
	 *
	 * A set comparison can be conducted to ensure
	 * that both the region list set that is active
	 * and the traversalable one match.
	 */	
	traverseFromRegisters() {

		let travInfo: Array<RegionNode> = [];
		let seenSet: Array<RegionData> = []; 
		
		if(this.hasRegisters()) {
			const registers = this.regions
				.registers[0];
			
			let queue: Array<[number, number, 
				RegionData]> = 
				[[0, 0, registers]];
			//seenSet.push(registers);

			//We should do a AABB check on edges
			while(queue.length > 0) {
				const pair = queue.shift();

				if(!pair) {
					break;
				}
				const [idx, gidx, region] = pair;
				//console.log(pair);
				//TODO: Refactor this type for this fn
				let aggNode: RegionNode = {
					regionData: region,
					parentRefs: [],
					adjacentRefs: [],
					ownIdx: gidx,
					dir: 0 //Unused for this case
				};
				
				if(!seenSet.includes(region)) {
					travInfo.push(aggNode); 
					//early push				
					seenSet.push(region);
				}
				if(region) {
					const regionAABBs = region
						.edgeAABBs();

					const reglist = 
					this.discoverFromEdges(
						regionAABBs);
					
					//Attempts to add regions to
					//queue and seenlist
					for(const r of reglist) {

						let tlistIdx = 
						r.ownIdx !== null ? 
						r.ownIdx : -1;
						
						const ridx = seenSet
						.indexOf(r.regionData);
						const nextPos = seenSet
							.length;

						//Add to seen list and 
							//travInfo
						if(ridx === -1) {
								
							seenSet
							.push(r.regionData);
							
							queue
							.unshift([nextPos,
								 tlistIdx, 
							r.regionData]);

							aggNode.adjacentRefs
							  .push(nextPos);

							travInfo.push({
							regionData: 
								r
								.regionData,
							parentRefs: [idx],
							adjacentRefs: [],
							ownIdx: tlistIdx,
							dir: 0
							});
						} else {
							const existNode = 
							travInfo[ridx];
							
							existNode
							.parentRefs
							.push(idx);
						}

						//Check to see if in 
						//adjacency list
						//Add it to adjacent list
						if(!aggNode.adjacentRefs
						   .includes(ridx) && 
						   	ridx >= 0) {
							
							aggNode.adjacentRefs
							.push(ridx);
						}


					}

					
				}

				
			}
		}
		//console.log(travInfo);

		return travInfo;
	}

	
	/**
	 * Traversal logic for resolving connections, preferences parents
	 * and then checks purely on adjacency.
	 *
	 * If Manually set it will be ignored
	 *
	 */
	resolveConnectionsFromTraversal(forceAll: boolean) {
		const seenlist = this.traverseFromRegisters();
		for(const rnode of seenlist) {
			const current = rnode.regionData;
			if(current.isConnectionSet() && !forceAll) {
				continue;
			}
			const cKind = current.getKind();
			if(cKind !== null) {
				const outSegment = current
					.getOutputCells();	
				const regRefs = rnode.parentRefs
					.concat(rnode.adjacentRefs);	
				for(const refidx of regRefs) {
					const reg = 
						seenlist[refidx].regionData;
					const rIdx = 
						seenlist[refidx].ownIdx;
					if(reg !== null && rIdx !== null) {
						const rKind = reg.getKind();
						
						if(cKind !== null 
						   && rKind !== null) {
							if(this
							.canConnectToKind(
							cKind, rKind)) {
							const [isSet, bestDir] =
								this
							.attemptConnections
							(outSegment, 
							reg, rKind);
							if(isSet) {
								current
								.setConnectionInformation(rKind, rIdx, 
											  bestDir);
								break;
								}
							}
						}
					}
				}
			}

		}
		

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
					Array<[RegionCell, boolean]>]{
		const dirStrings = RegionData.GetDirectionStrings();
		let offsets: Array<[number, number, number]> = [];
		
		let dirResult = 0;
		let mostCellsConnected = 0;
		let cellsConnected = 0;
		let cellMarkers: Array<[RegionCell, boolean]> = [];	
		//1. Gets the current set of directions we need 
		//	to check
		//	we need to then get the current offsets
		for(let o of dirToChecks) {
			if(dirStrings[o] === 'Up') {
				offsets.push([0, -1, 1]);
			}
			if(dirStrings[o] === 'Left') {

				offsets.push([-1, 0, 3]);
			}
			if(dirStrings[o] === 'Right') {

				offsets.push([1, 0, 2]);
			}
			if(dirStrings[o] === 'Down') {

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
					cellMarkers.push([cll, 
							 true]);
				} else {
					
					cellMarkers.push([cll, 
							 false]);
				}

			}
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
	 * @param {string} kind - kind of the this object
	 * @param {string} otherKind - kind of the other object
	 * @returns {boolean} if the two regions can connect
	 *
	 * Check to see if it is even viable, if it is isn't,
	 * we don't check, if it is then we attempt to connect
	 */
	static CanConnectToKind(kind: string, otherKind: string): 
		boolean {
		const srcKindSet = RegionKindMap[kind as 
			keyof RegionKindKeyMap];
		const check = (srcKindSet.includes(
			otherKind as keyof RegionKindKeyMap))
		
		return check;
	}

	/**
	 * @param {string} kind - kind of the this object
	 * @param {string} otherKind - kind of the other object
	 * @returns {boolean} if the two regions can connect
	 *
	 * Check to see if it is even viable, if it is isn't,
	 * we don't check, if it is then we attempt to connect
	 */
	canConnectToKind(kind: string, otherKind: string): boolean {
		return RegionDataList.CanConnectToKind(kind, 
						       otherKind)
	}

	/**
	 * Gets the connect kind index for encoding/recording 
	 * it into the cells
	 * so it can be saved with this information
	 */
	static GetConnectKindIndex(kind: string, otherKind: string): 
		number {
		
		const srcKindSet = RegionKindMap[
			kind as keyof RegionKindKeyMap];
		return srcKindSet.indexOf(
			otherKind as keyof RegionKindKeyMap);
	}

	getConnectKindIndex(kind: string, otherKind: string): number {
		return RegionDataList.GetConnectKindIndex(kind, 
							  otherKind);
	}
	
	/**
	 * Will attempt to provide the best suggestion
	 * based on heuristics
	 */
	attemptConnections(outSegment: RegionOutputSegment,
			   regionData: RegionData, 
			   regionKind: string): [boolean, number] {
		//TODO: Re-evaluate this check
		//let computedConnections = [];
		/*if(outSegment.kind === regionKind) {

			return false;
		}*/
		let bestConnections = 0;
		let bestDir = 0;
		let bestMarkers: Array<[RegionCell, boolean]> = [];

		let encKind = this.getConnectKindIndex(outSegment
							.kind, 
						       regionKind);
		
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
			for(const cpair of bestMarkers) {
				const [c, _] = cpair;
				c.cdir = bestDir;
				c.cnKind = encKind;
				c.manualSet = false;
			}
			return [true, bestDir];
		}
		return [false, bestDir];
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
			= regionCol.getOutputCells();
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
						const [isSet,bestDir] =
						this
						.attemptConnections(
							outSegment, 
							regionData, 
							regkey);

						if(isSet) { 
					regionCol.
					setConnectionInformation
						(regkey, rk, bestDir)

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
		 = { toolKind: -1, cell: null, visible: true };	
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
			const visible = fRes[idx][0].isVisible();
			res.visible = visible;
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
			let regData = fRes[idx].find((rd, _) => 
					rd.cells
					.get(rcStr) !== null);
			
			const kindKey = 
				RegionData.PluraliseKind(
				kindList[idx]) as keyof Regions;
			let regDataIdx = -1;
			for(let i = 0; i < 
			    this.regions[kindKey].length;
			    	i++) {
				const rmap = this
					.regions[kindKey][i].cells;
				if(rmap.has(rcStr)) {
					regDataIdx = i;
					break;
				}
			}

			return {
				regData,
				kind: kindKey,
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
		dlist.freeStack = this.freeStack.cloneFreeList();
		return dlist;
	}

	flattenWithTags(): Array<{kind: string, tag: string, 
		idx: number, rdata: RegionData}> {
		const regs = this.regions;
		let flatArray: Array<{
				kind: string
				tag: string
				rdata: RegionData
				idx: number
			}>= [];
		

		flatArray.push(...regs.bus.map((v, i) => 
			 { return {kind: 'bus', tag: `bus${i}`, 
				 rdata: v, idx: i} }));
		flatArray.push(...regs.registers.map((v, i) => 
			 { return {kind: 'register', 
				 tag: `registers${i}`, 
				 rdata: v, idx: i} }));
		flatArray.push(...regs.bellstates.map((v, i) => 
			 { return {kind: 'bellstate', 
			tag: `bellstates${i}`, rdata: v, idx: i}}));
				 
		flatArray.push(...regs.factories.map((v, i) => 
			 { return {kind: 'factory', 
				 tag: `factories${i}`, 
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
	
	
	
	resolveConnectionsOnChange(oldRegData: RegionData, 
				   toRemove: Set<string>,
				  idx: number) {
		const kind = oldRegData.getKind();
		const newRegData = oldRegData.cloneData();
		newRegData.cleanupRegionData(toRemove);
		//newRegData will have this info, now we need
		//defuse its connections
		const oldAABBs = oldRegData.edgeAABBs();
		const newAABBs = newRegData.edgeAABBs();
		const oldAdjacents = this.discoverFromEdges(oldAABBs);
		const newAdjacents = this.discoverFromEdges(newAABBs);

		if(oldAdjacents.length != newAdjacents.length) {
			//Assume newAdjacents is smaller	
			//find what got lost
			
			for(let oIdx = 0; oIdx < oldAdjacents.length; 
			    oIdx++) {
				
				const oReg = oldAdjacents[oIdx];
				let found = false;
				for(let nIdx = 0; nIdx < 
				    newAdjacents.length; nIdx++) {

					const nReg = 
						newAdjacents[nIdx];
					if(oReg.regionData === 
					   	nReg.regionData) {
						found = true;
					}
					

				}
				//Found a region that no longer maps
				//Check to see if it is still connected
				//or it is connected to 
				//the current region
				if(!found) {
					if(oReg.regionData
					   .matchConnection(kind,
							    idx)) {
						oReg.regionData
						.resetConnection();
					}
				}
			}
		}		
	}

	cleanupIntersections(data: RegionData) {
		const rset = data.keySet();
		const freeStack = this.freeStack;
		for(const key in this.regions) {
			//const dataToRemove = [];
			const kRegions = this.regions[
				key as keyof Regions];
			
			for(const rk in kRegions) {

				const eReg = kRegions[rk];
				if(eReg.isDead()) {
					continue;
				}

				const idx = Number(rk);
				let toRemove = this
					.resolveIntersections(rset, 
					eReg.keySet());
				//Clean up any connected region
				//That could have been adjacent
				if(toRemove.size != 0) {
					this
					.resolveConnectionsOnChange(
						eReg,
						toRemove,
						idx);
				}
				
				//Before we clean it up
				const r = eReg.cleanupRegionData(
					toRemove);
				
				if(r <= 0) {
					eReg.markAsDead();
					freeStack.pushOnKind(key, 
							     idx);
				}

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
		//Check freelist
		data.regionKind = pkey;
		if(this.freeStack.availableOnKind(pkey)) {
			const idx = this.freeStack
				.popOnKind(pkey);
			if(idx !== null) {
				this.regions[pkey][idx]
					.replaceWith(data);
			} else {	
				this.regions[pkey].push(data);
			}
		} else {
			this.regions[pkey].push(data);
		}
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
			.filter((rd) => !rd.isDead())
			.map((rd) => rd.flatten());
		regions.registers = this.regions.registers
			.filter((rd) => !rd.isDead())
			.map((rd) => rd.flatten());
		regions.bellstates = this.regions.bellstates
			.filter((rd) => !rd.isDead())
			.map((rd) => rd.flatten());
		regions.factories = this.regions.factories
			.filter((rd) => !rd.isDead())
			.map((rd) => rd.flatten());
		regions.buffers = this.regions.buffers
			.filter((rd) => !rd.isDead())
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

