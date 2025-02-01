import {WorkspaceData} from "../workspace/Workspace";
import {CUVolume} from "../../model/CallGraph";

export type CUDataKey = keyof CUVolume;
export type CUAggrKey = keyof DataAggrMap;

export type CGSample = {
	refId: string
	widgetIdx: number
	cuVolume: CUVolume 
}
export type DataAggrMap = {
	REGISTER_VOLUME: Array<number>
	FACTORY_VOLUME: Array<number>
	ROUTING_VOLUME: Array<number>
	T_IDLE_VOLUME: Array<number>
	BELL_IDLE_VOLUME: Array<number>
	BELL_ROUTING_VOLUME: Array<number>
	//NON_PARTICIPATORY_VOLUME: Array<number>
}

export type DataAggrIdentifier = {
	mxid: number
	cuid: number | null
	hash: string | null
}

export type DataAggregate = {
	idxs: Array<DataAggrIdentifier>
	aggrMap: DataAggrMap	
	dataRefs: Array<Array<number>>

}

export type CGMargins = {
	top: number
	bottom: number
	left: number
	right: number
}



export type CGChartDimensions = {
	wUnit: string
	width: number
	hUnit: string
	height: number
	margins: CGMargins
}

export type RunChartProps = {
	workspaceData: WorkspaceData 

}

export type CallGraphSpaceData = {
	workspaceData: WorkspaceData 
	//graphData: Array<Array<CGSample>>
	selKey: string 
}

export type CallGraphStatsData = {
	workspaceData: WorkspaceData
	graphData: DataAggregate	
	selKey: CUDataKey
	dimensions: CGChartDimensions	
}



export type CUDataKeyRef = {
	keyvalue: string 
}

export type CUWidgetKeyRef = {
	keyvalue: number 
}

export type CUScaleKeyRef = {
	keyvalue: string 
}

export type WidgetSelectorProps = {
	currentKeyRef: CUWidgetKeyRef
	keyRefUpdate: (key: number) => void
	optPairs: Array<{
		value: number 
		display: string 
	}>

}


