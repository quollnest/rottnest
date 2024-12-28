import React from 'react';
import GlobalBar from '../GlobalBar';
import RottnestService from '../../service/RottnestService';
import RottnestProject from '../../model/Project';
import DesignSpace from '../DesignSpace';
import WorkspaceContainer from './RowContainer';
//import { ToolContainer, RegionContainer } from './ColumnContainer';
import styles from '../styles/RottnestContainer.module.css';


const RottnestDefault = {
	toolbox: { 
		headerName: "Toolbox"
	},
	regionList: {
		regions: []
	},
	designSpace: {
		width: 20,
		height: 20,
	},
	errorList: {
		errors: []
	}

}

/**
 * Data that is required for the container,
 * events and functionality to operate on.
 *
 * TODO: Update the data parts to allow for
 * more strict typing
 */
type RottnestData = {
	toolboxData: any
	regionListData: any
	errorListData: any
	designSpaceData: any 
	selectedIndex: number
	project: RottnestProject
}

/**
 * At the moment, nothing interesting
 */
type RottnestProperties = {}

/**
 * Container for the main application
 * Will be a single page with a number of different
 * components rendered underneath it
 *
 */
class RottnestContainer extends React.Component<RottnestProperties, {}> {

	data: RottnestData = {
		toolboxData: {...RottnestDefault.toolbox},
		regionListData: {...RottnestDefault.regionList},
		errorListData: {...RottnestDefault.errorList},
		designSpaceData: {...RottnestDefault.designSpace},
		project: new RottnestProject(),
		selectedIndex: 0,
	}
	
	/**
	 * Saves a project by triggering a service
	 * event, this event is triggered by GlobalBar
	 */
	saveProject() {
		RottnestService.SaveToLocalStorage('rottnest', this.data.project);	
	}


	/**
	 * Loads a project by triggering a service event,
	 * this event is triggered by GlobalBar
	 */
	loadProject(project: string) {
		RottnestService.LoadFromLocalStorage(project);
	}


	getToolIndex() {
		return this.data.selectedIndex;
	}

	render() {
		const rottContainer = this;
		const updateables = new Map();
		const toolKind = 0;
		updateables.set(100, ['100%', rottContainer]);

		return (
			<div className={styles.rottnest}>
				<GlobalBar componentMap={
					updateables
				}/>
				<WorkspaceContainer 
					designSpace={
						{
							width: 20,
							height: 20,
						}
					}	
					container={rottContainer}
					toolKind={toolKind}
					/>
			</div>
		)
	}


}

export default RottnestContainer;
