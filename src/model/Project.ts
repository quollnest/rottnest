
/**
 * Project Details,
 * contains simple information about the project/architecture
 * This will be used by the settings form/project setup
 *
 */
export type ProjectDetails = {
	projectName: string
	author: string
	width: number
	height: number
	description: string	
}

export type RegionCell = {
	x: number
	y: number
}
export type FlatRegionData = {
	cells: Array<[string, RegionCell]>
}

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

