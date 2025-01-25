

export interface BufferMapTrigger {
	refresh(): void
}

export class WorkspaceBufferMap {
	context: BufferMapTrigger;	
	map: Map<string, string> = new Map();
	sharedMap: Map<string, any> = new Map();

	constructor(context: BufferMapTrigger) {
		this.context = context;
	}

	stash(key: string, data: any) {
		this.sharedMap
			.set(key, data);
	}

	dropStash() {
		this.sharedMap.clear();
	}

	getStash() {
		return this.sharedMap;
	}

	insert(key: string, data: any) {
		this.map.set(key, data);
	}

	get(key: string): any | null {
		const res = this.map.get(key);
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
