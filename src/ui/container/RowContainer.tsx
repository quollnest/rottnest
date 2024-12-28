import React from "react";

import styles from '../styles/WorkspaceContainer.module.css';
import { RegionContainer, ToolContainer } from "./ColumnContainer";
import { DesignSpace } from "../DesignSpace";
import RottnestContainer from "./RottnestContainer";

type WorkspaceData = {
	container: RottnestContainer
	toolKind: number
	zoomValue: number	
	designSpace: { width: number, height: number }

}


/**
 * Workspace Container holds the main
 * workspace components, including tools, regions and design space
 */
class WorkspaceContainer extends React.Component<WorkspaceData, {}> {
	
	render() {
		const data = this.props;
		const designSpace = { width: data.designSpace.width,
			height: data.designSpace.height,
			container: data.container,
			toolKind: data.toolKind,
			zoomValue: data.zoomValue
		};

		return (
			<div className={styles.workspaceContainer}>	
				<ToolContainer container={data.container}/>
				<DesignSpace {...designSpace } />
				<RegionContainer container={data.container}/>
			</div>
		)

	}
}

export default WorkspaceContainer;
