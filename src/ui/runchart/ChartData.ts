import {WorkspaceData} from "../workspace/Workspace";
import {CUVolume} from "../../model/CallGraph";
export type CUDataKey = keyof CUVolume;

export type CGSample = {
	refId: string
	widgetIdx: number
	cuVolume: CUVolume 
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

export type CallGraphSpaceData = {
	workspaceData: WorkspaceData 
	graphData: Array<Array<CGSample>>
	selKey: string 
}

export type CallGraphStatsData = {
	workspaceData: WorkspaceData
	graphData: Array<Array<CGSample>>
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


