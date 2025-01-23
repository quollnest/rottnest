
/**
 * We will assume that the data is a flat structure
 * with index links
 * I have opened it up to have fieldData that will
 * allow mapping for it
 */
export type WGraphEntry = {
	name: string
	description: string
	children: Array<number>
}


export type WidgetGraph = {
	graphIndex: number
	rootIndex: number
	graph: Array<WGraphEntry>

}

export function WidgetGraphDefault() {
	return {
		graph: [],
		rootIndex: 0,
		graphIndex: -1
	};
}
