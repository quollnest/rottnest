


export interface DeRott {
	fromStr(data: string): this | null
	fromJSON(data: any): this | null
}

export interface ReRott {
	toStr: () => string
}
