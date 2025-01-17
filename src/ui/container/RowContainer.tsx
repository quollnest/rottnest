import React from "react";

import styles from '../styles/WorkspaceContainer.module.css';
import { RegionContainer, ToolContainer } from "./ColumnContainer";
import { DesignSpace } from "../DesignSpace";
import RottnestContainer from "./RottnestContainer";
import {WidgetView} from "../WidgetView";
import {SchedulerVisualiser} from "../SchedulerIFrame";

type WorkspaceData = {
	container: RottnestContainer
	toolKind: number
	zoomValue: number	
	designSpace: { width: number, height: number }
	selectedTab: number
	tabTitles: Array<string>
	availableTabs: Array<boolean>
}

type WorkspaceTabData = {
	selectedTab: number
	tabTitles: Array<string>
	availableTabs: Array<boolean>
	container: RottnestContainer
}

type WorkspaceZoneData = {
	workspaceData: WorkspaceData
}

class WorkspaceTabBar extends React.Component<WorkspaceTabData, {}> {
	
	render() {
		const data = this.props;
		const container = data.container;
		const selTab = data.selectedTab;
		
		const avaibilities = data.availableTabs;

		const tabs = data.tabTitles.map((t, idx) => {

			const isSelected = idx == selTab;
			const available = avaibilities[idx];
			//const available = true;
			const updateSelected = () => {
				if(available) {
					container.updateSelectedTab(idx);
				}
			};

			return (
				<span key={idx}
					onClick={updateSelected}
					className={`${styles.workTab}
						${
						isSelected ? styles.selectedTab :
							''}
						${available === false ? 
							styles.workTabUnavailable : ''}`}>
						
					{t}
				</span>
				)
		});

		return (
			<div className={styles.workspaceTabBar}>
			{tabs}
			</div>
		)
	}
}


class WorkspaceZone extends React.Component<WorkspaceZoneData, {}> {
	
	tabComponents = [

		() => { return (<DesignSpace {...
			{ 
				width: this.props.workspaceData.designSpace.width,
				height: this.props.workspaceData.designSpace.height,
				container: this.props.workspaceData.container,
				toolKind: this.props.workspaceData.toolKind,
				zoomValue: this.props.workspaceData.zoomValue
			}
 		} />) },
		() => { return (<WidgetView />) },
		() => { return ( <SchedulerVisualiser visData={this.props
				.workspaceData.container.state.visData}/>) }

	];

	render() {
		
		const data = this.props.workspaceData;
		const selTab = data.selectedTab;
		const tabTitles = data.tabTitles;
		const availableTabs = data.availableTabs;
		const selectedTab = data.selectedTab;

		const tabComp = this.tabComponents[selectedTab 
			% this.tabComponents.length]	
		
		
		return (<div className={styles.workspaceZone}>
				<WorkspaceTabBar 
					tabTitles={tabTitles}
					container={data.container}
					selectedTab={selTab} 
					availableTabs={availableTabs}
					/>
				{tabComp()}	
			</div>)
	}

}

/**
 * Workspace Container holds the main
 * workspace components, including tools, regions and design space
 */
class WorkspaceContainer extends React.Component<WorkspaceData, {}> {
	
	render() {
		const data = this.props;
		
		return (
			<div className={styles.workspaceContainer}>	
				<ToolContainer container={data.container}/>
				<WorkspaceZone  workspaceData={data} />
				<RegionContainer container={data.container}/>
			</div>
		)

	}
}

export default WorkspaceContainer;
