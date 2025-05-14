
import {RegionContainer, ToolContainer} 
	from "../container/ColumnContainer"
import { WorkspaceProps, WorkspaceGroup } from "./Workspace"
import {ReactElement} from "react";
import {WorkspaceZone} from "./WorkspaceZone";
import { GimDesignSpace } from "../plugin/gim/DesignSpace";

//Originally the WorkspaceContainer
export class ArchGroup implements WorkspaceGroup {
	
	MakeGroup(data: WorkspaceProps): Array<ReactElement> {

		const desSpace = <GimDesignSpace {...data} />;

		const group = [
			<ToolContainer key={"arch_gim_toolcontainer"} 
				{...data} />,
			<WorkspaceZone 
				key={"arch_wz_design_space"}
				wsComponent={desSpace}
				workspaceData={{
					container: data.workspaceData
					.container,
					bufferMap: data
						.workspaceData
						.bufferMap
				}} />,
			<RegionContainer 
				key={"arch_region_container"}
				{...data} />,
		];

		return group;
	}

}


