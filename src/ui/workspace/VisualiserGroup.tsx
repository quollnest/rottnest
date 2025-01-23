
import {RegionContainer, ToolContainer} 
	from "../container/ColumnContainer"
import {SchedulerVisualiser} from "../SchedulerIFrame";
import { WorkspaceData, WorkspaceGroup, WorkspaceProps } from "./Workspace"
import {ReactElement} from "react";
import {WorkspaceZone} from "./WorkspaceZone";

export class VisualiserGroup implements WorkspaceGroup {
	
	MakeGroup(data: WorkspaceProps): Array<ReactElement> {
		const nWorkSpace: WorkspaceData = {
			container: data.workspaceData.container,
			bufferMap: data.workspaceData.bufferMap
		};

		const svisSpace = <SchedulerVisualiser {...nWorkSpace}  />;

		const group = [
			<ToolContainer key={"arch_toolcontainer"} 
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
			<RegionContainer 
				key={"arch_region_container"}
				{...data} />,
		];	

		return group;
	}

}


