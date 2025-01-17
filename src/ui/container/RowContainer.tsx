import React from "react";

import styles from '../styles/WorkspaceContainer.module.css';
import {WorkspaceData, WorkspaceGroup, WorkspaceProps} 
	from "../workspace/Workspace";
import {ArchGroup} from "../workspace/ArchGroup";
import {VisualiserGroup} from "../workspace/VisualiserGroup";
import {WidgetGroup} from "../workspace/WidgetGroup";


/**
 * Workspace Container holds the main
 * workspace components, including tools, regions and design space
 */
class WorkspaceContainer extends React.Component<WorkspaceData, {}> {
	
	workspaceGroups: Array<WorkspaceGroup> = [
		new ArchGroup(),
		new WidgetGroup(),
		new VisualiserGroup
	]

	render() {
		const data = this.props;
		const group = this.workspaceGroups[data
			.container.state.tabData.selectedTabIndex %
			this.workspaceGroups.length];
		
		const wdata : WorkspaceProps = { 
			workspaceData: {
			container: data.container
		}};

		const comps = group.MakeGroup(wdata);

		return (
			<div className={styles.workspaceContainer}>
				{comps}
			</div>
		)

	}
}

export default WorkspaceContainer;
