import { CallGraphSpace } from "../callgraph/CallGraphSpace";
import { WorkspaceGroup, WorkspaceProps } from "./Workspace"
import {ReactElement} from "react";
import {WorkspaceZone} from "./WorkspaceZone";
import {CGGraphColumn, CGNodeColumn} 
	from "../callgraph/CallGraphColumn";
import {RunChartSpace} from "../runchart/RunChart";
//Originally the WorkspaceContainer
export class RunChartGroup implements WorkspaceGroup {
	
	MakeGroup(data: WorkspaceProps): Array<ReactElement> {

		const wspace = <CallGraphSpace 
			{...data.workspaceData} />;	
		const group = [
			<CGGraphColumn 
			key={"widget_graph_column"} 
				{...data} />,
			<WorkspaceZone 	
				key={"widget_wz_design_space"}
				wsComponent={wspace}
				workspaceData={{
					container: data
					.workspaceData
					.container,
					bufferMap: data
					.workspaceData.bufferMap
				}} 
				/>,
			<CGNodeColumn 
				key={"widget_node_column"}
				{...data} />,
		];	
		return group;
	}

}


