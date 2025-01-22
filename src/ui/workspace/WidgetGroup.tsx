import {WidgetSpace} from "../widget/WidgetSpace";
import { WorkspaceGroup, WorkspaceProps } from "./Workspace"
import {ReactElement} from "react";
import {WorkspaceZone} from "./WorkspaceZone";
import {WidgetGraphColumn, WidgetNodeColumn} 
	from "../widget/WidgetColumn";
//Originally the WorkspaceContainer
export class WidgetGroup implements WorkspaceGroup {
	
	MakeGroup(data: WorkspaceProps): Array<ReactElement> {

		const wspace = <WidgetSpace 
			{...data.workspaceData} />;	
		const group = [
			<WidgetGraphColumn key={"widget_graph_column"} 
				{...data} />,
			<WorkspaceZone 	
				key={"widget_wz_design_space"}
				wsComponent={wspace}
				workspaceData={{
					container: data.workspaceData
					.container,
					bufferMap: data
					.workspaceData.bufferMap
				}} 
				/>,
			<WidgetNodeColumn 
				key={"widget_node_column"}
				{...data} />,
		];	
		return group;
	}

}


