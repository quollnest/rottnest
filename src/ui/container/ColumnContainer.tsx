import React from 'react';
import Toolbox from '../Toolbox';
import ToolboxOptions from '../ToolboxOptions';
import RegionList from '../RegionList';
import ErrorList from '../ErrorList';

import toolStyle from '../styles/ToolContainer.module.css'
import regionStyle from '../styles/RegionContainer.module.css'
import RottnestContainer from './RottnestContainer';
import RegionSettings from '../RegionSettings';
import {RottnestKindMap} from '../../model/KindMap';
import {RegionData} from '../../model/RegionData';

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
		regions: []
	},
	errorList: {
		errors: []
	}

}

type ToolContainerProps = {
	container: RottnestContainer
}

/**
 * Region Container that is a column container
 * that contains both region list and errors
 */
export class ToolContainer extends 
	React.Component<ToolContainerProps, {}> {	
	render() {
		const container = this.props.container;
		return (
			<div className={toolStyle.toolContainer}
				onMouseMove={
					(_) => {
						container
						.resetDSMove();
					}
				}>
				<Toolbox 
					toolbox={ 
						{ headerName: 
						ContainerDefaults
						.toolbox.headerName 
						} 
					} 
					container={this
						.props.container}/>
				<ToolboxOptions  
					headerName={"Options"}
					container={container}
				/>
			</div>
		)
	}

}


type RegionContainerProps = {
	container: RottnestContainer
}

/**
 * Region Container that is a column container
 * that contains both region list and errors
 */
export class RegionContainer 
	extends React.Component<RegionContainerProps, {}> {

	render() {
		const container = this.props.container;
		const regionList = container.getRegionList();
		
		const regListInfo = container.getRegionListData();
		const selected = regListInfo.selectedKind;
		const regKeyVal = regListInfo.selectedKind !== null ?
			regListInfo.selectedKind : 'NA';
		const regSingular = RegionData.SingularKind(
			regKeyVal);
		const regKind = regSingular as keyof RottnestKindMap;
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
				connectedIdx = regData.connectionToIdx;
			}		
			if(regData.connectionToKind!== null) {
				connectedKind = regData.connectionToKind;
			}
		} 
		
		return (
			<div className={regionStyle.regionContainer}
				onMouseMove={
					(_) => {
						container
						.resetDSMove();
					}
				}>
				<RegionList 
					regions={regionList} 
					container={container}
					/>
				<RegionSettings 
					container={container}
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
					} />
					
				<ErrorList 
					{...ContainerDefaults
						.errorList} />
			</div>
		)
	}
}

