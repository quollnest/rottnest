import React from 'react';
import GlobalBar from '../ui/GlobalBar';
import RottnestService from '../service/RottnestService';
import RottnestProject from '../model/Project';
import Toolbox from '../ui/Toolbox';
import RegionList from '../ui/RegionList';
import DesignSpace from '../ui/DesignSpace';
import ErrorList from '../ui/ErrorList';

const RottnestDefault = {
	toolbox: { 
		headerName: "Toolbox"
	},
	regionList: {
		regions: []
	},
	designSpace: {
		width: 50,
		height: 50,
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


	render() {
		return (
			<>
				<GlobalBar />
				<Toolbox {...RottnestDefault.toolbox} />
				<RegionList {...RottnestDefault.regionList}/>
				<ErrorList {...RottnestDefault.errorList} />
				<DesignSpace {...RottnestDefault.designSpace}/>

			</>
		)
	}


}

export default RottnestContainer;
