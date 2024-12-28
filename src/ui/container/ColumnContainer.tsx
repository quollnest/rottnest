import React from 'react';
import Toolbox from '../Toolbox';
import ToolboxOptions from '../ToolboxOptions';
import RegionList from '../RegionList';
import ErrorList from '../ErrorList';

import toolStyle from '../styles/ToolContainer.module.css'
import regionStyle from '../styles/RegionContainer.module.css'
import RottnestContainer from './RottnestContainer';


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
 *
 */
export class ToolContainer extends React.Component<ToolContainerProps, {}> {

	render() {
		return (
			<div className={toolStyle.toolContainer}>
				<Toolbox 
					toolbox={ 
						{ headerName: 
							ContainerDefaults
						.toolbox.headerName 
						} 
					} 
					container={this.props.container}/>
				<ToolboxOptions 
					{ ...ContainerDefaults.options} />
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
 *
 */
export class RegionContainer extends React.Component<RegionContainerProps, {}> {

	render() {
		const container = this.props.container;
		const regionList = container.getRegionList();

		return (
			<div className={regionStyle.regionContainer}>
				<RegionList regions={regionList} />
				<ErrorList 
					{...ContainerDefaults.errorList} />
			</div>
		)
	}

}


