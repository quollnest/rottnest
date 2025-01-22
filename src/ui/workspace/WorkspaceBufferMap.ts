

export interface BufferMapTrigger {
	refresh(): void
}

export class WorkspaceBufferMap {
	context: BufferMapTrigger;	
	map: Map<string, string> = new Map();

	constructor(context: BufferMapTrigger) {
		this.context = context;
	}

	insert(key: string, data: any) {
		this.map.set(key, data);
		console.log(this.map);
	}

	get(key: string): any | null {
		const res = this.map.get(key);
		console.log(res, key);
		if(res === null || res === undefined) {
			return null;
		} else {
			return res;
		}
	}

	clear() {
		this.map.clear();
	}
	
	/**
	 * Triggers a refresh of the workspace zone
	 */
	commit() {
		this.context.refresh();
	}
}
