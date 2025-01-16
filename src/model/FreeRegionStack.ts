
export type FreeRegions = {
	bus: Array<number>
	registers: Array<number>
	bellstates: Array<number>
	factories: Array<number>
	buffers: Array<number>
}

export class FreeRegionStack {
	
	freeRegions: FreeRegions = {
		bus: [],
		registers: [],
		bellstates: [],
		factories: [],
		buffers: [],
	}

	constructor() {
		this.freeRegions = {
			bus: [],
			registers: [],
			bellstates: [],
			factories: [],
			buffers: [],
		}
	}

	availableOnKind(kind: string): boolean {
		const keyFR = kind as keyof FreeRegions;	
		const flist = this.freeRegions[keyFR];
		return flist.length > 0;
	}

	popOnKind(kind: string): number | null {
		
		const keyFR = kind as keyof FreeRegions;	
		const flist = this.freeRegions[keyFR];
		
		console.log(flist);
		if(this.availableOnKind(kind)) {
			
			const v = flist.shift();
			console.log(flist);
			if(v !== null && v !== undefined) { 
				return v; 
			}
		} 
		return null;
		
	}

	pushOnKind(kind: string, v: number) {
		const keyFR = kind as keyof FreeRegions;	
		const flist = this.freeRegions[keyFR];
		console.log(flist);	
		flist.push(v);
	}

	cloneFreeList(): FreeRegionStack {
		let frs: FreeRegions = {
			bus: [...this.freeRegions.bus],
			registers: [...this.freeRegions.registers],
			bellstates: [...this.freeRegions.bellstates],
			factories: [...this.freeRegions.factories],
			buffers: [...this.freeRegions.buffers]
		};

		let fstack: FreeRegionStack = new FreeRegionStack();
		fstack.freeRegions = frs;//duplicate it

		return fstack;
	}

}

