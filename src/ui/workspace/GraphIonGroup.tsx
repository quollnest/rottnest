
import {RegionContainer, ToolContainer} 
	from "../container/ColumnContainer"
import { WorkspaceProps } from "./Workspace"
import { WorkspaceGroup } from "./Workspace"
import {DesignSpace} from "../DesignSpace"
import {ReactElement} from "react";
import {WorkspaceZone} from "./WorkspaceZone";

//Originally the WorkspaceContainer
export class ArchGroup implements WorkspaceGroup {
	
	MakeGroup(data: WorkspaceProps): Array<ReactElement> {

		const desSpace = <DesignSpace {...data} />;

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


