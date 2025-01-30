import React, {CSSProperties} from "react";
import { WorkspaceData } from "../workspace/Workspace";


type CallGraphStatsData = {
	workspaceData: WorkspaceData

}

type CallGraphStatsState = {

}

type CallGraphChartEntry = {
	time: string
	measure: number
}

class CallGraphStatsSpace extends React.Component<CallGraphStatsData,
	CallGraphStatsState> {


	genLineGraph(data: Array<CallGraphChartEntry>) {
		
	}

	render() {
		return (
			<>
			</>
		)
	}
}
