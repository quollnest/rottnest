
import {RegionContainer, ToolContainer} 
	from "../container/ColumnContainer"
import {SchedulerVisualiser} from "../SchedulerIFrame";
import { WorkspaceGroup, WorkspaceProps } from "./Workspace"
import {ReactElement} from "react";
import {WorkspaceZone} from "./WorkspaceZone";

export class VisualiserGroup implements WorkspaceGroup {
	
	MakeGroup(data: WorkspaceProps): Array<ReactElement> {
		
		const svisSpace = <SchedulerVisualiser  {...{
				container: data
				.workspaceData.container 
			}} />;
		const group = [
			<ToolContainer key={"arch_toolcontainer"} 
				{...data} />,
			<WorkspaceZone 
				key={"arch_wz_design_space"}
				wsComponent={svisSpace}
				workspaceData={{
					container: data.workspaceData
					.container
				}} />,		
			<RegionContainer 
				key={"arch_region_container"}
				{...data} />,
		];	

		return group;
	}

}


