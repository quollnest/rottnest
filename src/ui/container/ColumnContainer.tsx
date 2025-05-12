import React from 'react';
import Toolbox from '../Toolbox';
import ToolboxOptions from '../ToolboxOptions';
import RegionList from '../RegionList';
import ErrorList from '../err/ErrorList';
import RegionSettings from '../RegionSettings';
import {RottnestKindMap} from '../../model/RegionKindMap';
import {RegionData} from '../../model/RegionData';
import {Workspace, WorkspaceProps} from '../workspace/Workspace';

import toolStyle from '../styles/ToolContainer.module.css'
import regionStyle from '../styles/RegionContainer.module.css'

/**
 * ContainerDefaults,
 * Not really used anymore
 */
const ContainerDefaults = {
	toolbox: { 
		headerName: "Toolbox",
		selectedToolIndex: 0,
	},
	options: {	
		headerName: "Tool Options",
		toolKind: 0,
	},
	regionList: {
		headerName: "Regions",
		regions: []
	},
	errorList: {
		errors: []
	}

}

/**
 * Region Container that is a column container
 * that contains both region list and errors
 */
export class ToolContainer extends 
	React.Component<WorkspaceProps, {}> 
	implements Workspace {	
	render() {
		const container = this.props
			.workspaceData.container;
		return (
			<div 
				className={toolStyle.toolContainer}
				data-component="tool_container"
				data-help-id="tool_container"
				onMouseMove={
					(_) => {
						container
						.resetDSMove();
					}
				}
			>
				<Toolbox 
					toolbox={ 
						{ headerName: 
						ContainerDefaults
						.toolbox.headerName 
						} 
					} 
					container={container}
					data-component="toolbox_panel"
					data-help-id="toolbox_panel"
				/>
				<ToolboxOptions  
					headerName={"Options"}
					container={container}
					data-component="toolbox_options"
					data-help-id="toolbox_options"
				/>
			</div>
		)
	}

}

/**
 * Region Container that is a column container
 * that contains both region list and errors
 */
export class RegionContainer 
	extends React.Component<WorkspaceProps, {}> 
	implements Workspace {	


	render() {
		const container = this.props.workspaceData
			.container;
		const regionList = container.getRegionList();
		
		const regListInfo = container.getRegionListData();
		const selected = regListInfo.selectedKind;
		const regKeyVal = regListInfo.selectedKind 
			!== null ?
			regListInfo.selectedKind : 'NA';
		const regSingular = RegionData.SingularKind(
			regKeyVal);
		const regKind = 
			regSingular as keyof RottnestKindMap;
		const subtypesCol = selected === '' || 
			selected === null ? [] :
			regListInfo.subTypes[regKind]
		
		const connRecs = container
			.getValidAdjacentsOfSelected();

		const regData = container.getSelectedRegionData();
		let connectedIdx = 0;
		let connectedKind = null;
		
		if(regData) {
			if(regData.connectionToIdx !== null) {
				connectedIdx = regData
				.connectionToIdx;
			}
			if(regData.connectionToKind!== null) {
				connectedKind = regData
				.connectionToKind;
			}
		} 
		
		return (
			<div
				className={regionStyle.regionContainer}
				data-component="region_container"
				data-help-id="region_container"
				onMouseMove={
					(_) => {
						container
						.resetDSMove();
					}
				}
			>
				<RegionList
					regions={regionList}
					container={container}
					data-component="region_list"
					data-help-id="region_list"
				/>
				<RegionSettings
					container={container}
					data-component="region_settings"
					data-help-id="region_settings"
					subTypes={
						{
						subtypes:
						 subtypesCol,
						currentlySelected:
						 regListInfo
						 .selectedIdx
						}
					}
					connections={
						{
						connections:
						 connRecs,
						connectedIdx:
						 connectedIdx,
						connectedKind:
						 connectedKind
						}
					}
				/>

					
					
				<ErrorList rtc={container} errors={[]}
					data-component="error_list"
					data-help-id="error_list"
					/>
			</div>
		)

	}
}

