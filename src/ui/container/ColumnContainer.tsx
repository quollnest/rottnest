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
		const regKind = regListInfo.selectedKind as keyof RottnestKindMap;
		const subtypesCol = selected === '' || selected === null ? [] :
			regListInfo.subTypes[regKind]
		
		const connRecs = regListInfo.connectionRecs;
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
							subtypes: subtypesCol,
							currentlySelected: regListInfo.selectedIdx
						}
					} 
					connections={
						{
							connections: connRecs,
							selectedIdx: 0,
						}
					} />
					
				<ErrorList 
					{...ContainerDefaults
						.errorList} />
			</div>
		)
	}

}


