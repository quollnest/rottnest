
import {RegionContainer, ToolContainer} 
	from "../container/ColumnContainer"
import {WidgetSpace} from "../WidgetSpace";
import { WorkspaceGroup, WorkspaceProps } from "./Workspace"
import {ReactElement} from "react";
import {WorkspaceZone} from "./WorkspaceZone";


//Originally the WorkspaceContainer
export class WidgetGroup implements WorkspaceGroup {
	
	MakeGroup(data: WorkspaceProps): Array<ReactElement> {
		const wspace = <WidgetSpace {...{
				container: data
				.workspaceData.container 
			}} />;	
		const group = [
			<ToolContainer key={"arch_toolcontainer"} 
				{...data} />,
			<WorkspaceZone 	
				key={"arch_wz_design_space"}
				wsComponent={wspace}
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


