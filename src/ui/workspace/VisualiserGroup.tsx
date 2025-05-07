import {SchedulerVisualiser} from "../vis/VisualiserOperations.tsx";
import { WorkspaceData, WorkspaceGroup, WorkspaceProps } from "./Workspace"
import {ReactElement} from "react";
import {WorkspaceZone} from "./WorkspaceZone"
import {CGGraphColumn, CGNodeColumn} from "../callgraph/CallGraphColumn";

export class VisualiserGroup implements WorkspaceGroup {
	
	MakeGroup(data: WorkspaceProps): Array<ReactElement> {
		const nWorkSpace: WorkspaceData = {
			container: data.workspaceData.container,
			bufferMap: data.workspaceData.bufferMap
		};

		const svisSpace = <SchedulerVisualiser workspaceData={nWorkSpace}  />;
		

		const group = [
			<CGGraphColumn 
			key={"widget_graph_column"} 
				{...data} />,
			<WorkspaceZone 
				key={"arch_wz_design_space"}
				wsComponent={svisSpace}
				workspaceData={{
					container: data.workspaceData
					.container,
					bufferMap: data
					.workspaceData.bufferMap
				}} />,		
			<CGNodeColumn 
				key={"widget_node_column"}
				{...data} />,
		];	

		return group;
	}

}


