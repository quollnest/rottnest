import React, {ReactElement} from 'react';
import RottnestContainer from "../container/RottnestContainer"
import styles from '../styles/WorkspaceContainer.module.css';
import {Workspace, WorkspaceData} from './Workspace';

type WorkspaceTabData = {
	selectedTab: number
	tabTitles: Array<string>
	availableTabs: Array<boolean>
	container: RottnestContainer
}

type WorkspaceZoneData = {
	workspaceData: WorkspaceData
	wsComponent: ReactElement 
}

class WorkspaceTabBar extends React
	.Component<WorkspaceTabData, {}> {
	
	render() {
		const data = this.props;
		const container = data.container;
		const selTab = data.selectedTab;
		
		const avaibilities = data.availableTabs;

		const tabs = data.tabTitles.map((t, idx) => {

			const isSelected = idx == selTab;
			const available = avaibilities[idx];
			const updateSelected = () => {
				if(available) {
					container
					.updateSelectedTab(idx);
				}
			};

			return (
				<span key={idx}
				onClick={updateSelected}
				className={`${styles.workTab}
					${ isSelected ? 
					styles.selectedTab : '' }
					${ available === false ? 
					styles
					.workTabUnavailable:''}`}>
					{t}
				</span>
			)
		});

		return (
			<div className={styles
				.workspaceTabBar}>
			{tabs}
			</div>
		)
	}
}


export class WorkspaceZone 
	extends React.Component<WorkspaceZoneData, {}> 
	implements Workspace {

	render() {

		const component = this.props.wsComponent;	
		const data = this.props.workspaceData;
		const selTab = data.container.
			state.tabData.selectedTabIndex;
		const tabTitles = data.container.
			state.tabData.tabNames;
		const availableTabs = data
			.container.state
			.tabData.availableTabs;	
		
		return (<div className={styles.workspaceZone}>
				<WorkspaceTabBar 
				tabTitles={tabTitles}
				container={data.container}
				selectedTab={selTab} 
				availableTabs={availableTabs}
				/>
				{component};	
			</div>);
			
	}
}
