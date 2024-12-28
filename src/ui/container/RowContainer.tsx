import React from "react";

import styles from '../styles/WorkspaceContainer.module.css';
import { RegionContainer, ToolContainer } from "./ColumnContainer";
import { DesignSpace } from "../DesignSpace";
import RottnestContainer from "./RottnestContainer";

type WorkspaceDefaults = {
	container: RottnestContainer
	toolKind: number
	designSpace: { width: number, height: number }

}


/**
 * Workspace Container holds the main
 * workspace components, including tools, regions and design space
 */
class WorkspaceContainer extends React.Component<WorkspaceDefaults, {}> {
	
	render() {
		const data = this.props;
		const designSpace = { width: data.designSpace.width,
			height: data.designSpace.height,
			container: data.container,
			toolKind: data.toolKind
		};

		return (
			<div className={styles.workspaceContainer}>	
				<ToolContainer container={data.container}/>
				<DesignSpace {...designSpace } />
				<RegionContainer />
			</div>
		)

	}
}

export default WorkspaceContainer;
