import React from "react";

import styles from '../styles/WorkspaceContainer.module.css';
import {WorkspaceContainerProps, WorkspaceGroup, WorkspaceProps} 
	from "../workspace/Workspace";
import {ArchGroup} from "../workspace/ArchGroup";
import {VisualiserGroup} from "../workspace/VisualiserGroup";
import {CallGraphGroup} from "../workspace/CallGraphGroup";
import {BufferMapTrigger, WorkspaceBufferMap} 
	from "../workspace/WorkspaceBufferMap";


type WorkspaceContainerState = {
	bufferMap: WorkspaceBufferMap
}

/**
 * Workspace Container holds the main
 * workspace components, including tools, regions and design space
 */
class WorkspaceContainer 
	extends React.Component<WorkspaceContainerProps, 
		WorkspaceContainerState> 
	implements BufferMapTrigger
	{
	
	state: WorkspaceContainerState = {
		bufferMap: new WorkspaceBufferMap(this)
	}

	workspaceGroups: Array<WorkspaceGroup> = [
		new ArchGroup(),
		new CallGraphGroup(),
		new VisualiserGroup()
	]
	
	refresh() {
		const nState = {...this.state};
		this.setState(nState);
	}


	render() {
		const data = this.props;
		const group = this.workspaceGroups[data
			.container.state.tabData.selectedTabIndex %
			this.workspaceGroups.length];
		
		const wdata : WorkspaceProps = { 
			workspaceData: {
				container: data.container,
				bufferMap: this.state.bufferMap
			}
		};

		const comps = group.MakeGroup(wdata);

		return (
			<div className={styles.workspaceContainer}>
				{comps}
			</div>
		)
	}
}

export default WorkspaceContainer;
