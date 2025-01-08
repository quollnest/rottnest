import React from 'react';
import GlobalBar from '../GlobalBar';
import RottnestService from '../../service/RottnestService';
import {ProjectDetails, 
	RegionDataList,
	ProjectDump} 
	from '../../model/Project';
import { RegionData, Regions } from '../../model/RegionData';
import WorkspaceContainer from './RowContainer';
import SettingsForm from './SettingsForm';

import styles from '../styles/RottnestContainer.module.css';
import {DesignSpace} from '../DesignSpace';
import NewProjectForm from './NewProjectForm';



/**
 * This allows for undo and redo functionality
 * within the container system
 * TODO: Move to another file
 */
class RegionsSnapshotStack {
	
	redoListStack: Array<RegionDataList> = [];
	regionListStack: Array<RegionDataList> = [];
	capacity: number = 32;

	/**
	 * New regionList object will be pushed onto
	 * the stack. This happens when a new region is
	 * drawn
	 */
	push(list: RegionDataList) {
		if(this.regionListStack.length >= 
		   this.capacity) {
			this.regionListStack.pop();	
			this.regionListStack.unshift(list);
		} else {
			this.regionListStack.unshift(list);
		}
	}
	
	/**
	 * Used as part of the undo functionality,
	 * when the user hits undo, it will pop what is
	 * in the regionListStack
	 */
	pop(): RegionDataList | null | undefined {
		if(this.regionListStack.length > 0) {
			let res = this.regionListStack.shift();
			return res;
		}
		return null;
	}
	
	/**
	 * Takes the current regiondata list and
	 * adds it to the redo list.
	 *
	 * It will then pop the top the undo list.
	 * This will be then used as the current
	 * region data list in the container
	 * 
	 */
	undoAction(current: RegionDataList): RegionDataList 
		| null | undefined {
		//Only valid case
		if(this.regionListStack.length > 0) {
			let res = this.regionListStack.shift();
			this.redoListStack.unshift(current);
			return res;
		}
		return null;
	}

	/**
	 * Pops the redo list and replaces it
	 * as the current regiondatalist, the 
	 * current regiondatalist will then be
	 * placed in the undo list
	 */
	redoAction(current: RegionDataList): RegionDataList 
		| null | undefined {
				
		if(this.redoListStack.length > 0) {
			let res = this.redoListStack.shift();
			this.regionListStack.unshift(current);
			return res;
		}
		return null;
	}

	onAction(current: RegionDataList) {
		this.push(current);
		this.redoListStack = [];
	}

}

/**
 * Data that is required for the container,
 * events and functionality to operate on.
 *
 * TODO: Update the data parts to allow for
 * more strict typing
 */
/*type RottnestData = {
	toolboxData: any
	regionListData: any
	errorListData: any
	designSpaceData: any 
	selectedIndex: number
	project: RottnestProject
}*/

/**
 * At the moment, nothing interesting
 */
type RottnestProperties = {}

/**
 *  Container State information
 *  that can be updated by other components
 *  or internally.
 */
type RottnestAppState = {
	settingsActive: boolean
	newProjectActive: boolean
	helpActive: boolean
	colourblindActive: boolean
	zoomValue: number
	componentData: {
		selectedTool: number
		selectedRegion: number
	}

}


type RottnestWorkData = {
	undoStack: RegionsSnapshotStack
	currentRDBuffer: RegionData
}




/**
 * Maintains state information related to
 * rendering and data
 */
type RottnestState = {
	projectDetails: ProjectDetails
	appStateData: RottnestAppState
	regionList: RegionDataList
}

type ComponentMonitor = {
	designSpace: DesignSpace | null
	settingsForm: SettingsForm | null
}

/**
 * Container for the main application
 * Will be a single page with a number of different
 * components rendered underneath it
 *
 */
class RottnestContainer 
	extends React.Component<RottnestProperties, 
	RottnestState> {

	state: RottnestState = {
		projectDetails: {
			projectName: 'Project1', 
			author: 'User',
			width: 20,
			height: 20,
			description: 'Quick Description'
		},
		regionList: new RegionDataList(),
		appStateData: {
			settingsActive: false,
			newProjectActive: false,
			zoomValue: 100,
			colourblindActive: false,
			helpActive: false,
			componentData: {
				selectedTool: 0,
				selectedRegion: 0
			}
		}
	};



	monitorComponent: ComponentMonitor = {
		designSpace: null,
		settingsForm: null
	}

	regionStack: RegionsSnapshotStack = 
		new RegionsSnapshotStack();
	currentRDBuffer: RegionData = new RegionData();
	
	resetData() {
		this.state.regionList = new RegionDataList();
		this.state.appStateData = {
			settingsActive: false,
			newProjectActive: false,
			zoomValue: 100,
			colourblindActive: false,
			helpActive: false,
			componentData: {
				selectedTool: 0,
				selectedRegion: 0
			}
		};
		this.regionStack = new RegionsSnapshotStack();
		this.currentRDBuffer = new RegionData();

	}

	registerDesignSpace(designSpace: DesignSpace) {
	       this.monitorComponent.designSpace = designSpace;
	}

	registerSettingsForm(settingsForm: SettingsForm) {
	       this.monitorComponent.settingsForm = settingsForm;
	}

	parseLoadedFile(content: string | ArrayBuffer | null) {
		//TODO: I hate the comparison here
		//but I am using bad APIs, revisit this later
		//	:( 
		//	Broke my rule about violating the type
		//	system
		if(content && typeof content == 'string') {
			const jsonRep = JSON.parse(content);
			if(jsonRep) {
				const partialDump: 
					Partial<ProjectDump> 
					= jsonRep;
				const dump: ProjectDump =
				{
					project: 
						partialDump.project 
						!= null ?
						jsonRep.project :
						this.state
						.projectDetails,
					regions:
						partialDump.regions
						!= null ?
						jsonRep.regions :
						this.state
						.regionList
				}
				this.state.projectDetails =
					dump.project;
				this.state.regionList = 
					RegionDataList.fromFlatten(
						dump.regions);
				

				this.triggerUpdate();
			}
			
		}
	}

	getProjectDetails() {
		return this.state.projectDetails;
	}

	getCurrentRDBuffer(): RegionData {
		return this.currentRDBuffer;
	}

	getRegionList(): RegionDataList {
		return this.state.regionList;
	}
	
	/**
	 * TODO: Move this function to another place
	 * 	Centralise the tool/region mapping controls
	 * 	and make it consistent
	 */
	toolToRegionKey(): keyof Regions | null {

		switch(this.getToolIndex()) {
			case 1:
				return 'buffers';
			case 2:
				return 'bus';
			case 3:
				return 'tfactories';
			case 4:
				return 'bellstates';
			case 5:
				return 'registers';
			default:
				break;
		}

		return null;
	}

	/**
	 * Applys the current regiondata buffer to 
	 * the region list. It will then duplicate the
	 * current regionlist and move on.
	 */	
	applyRDBuffer() {
		const oldBuffer = this.currentRDBuffer;
		this.currentRDBuffer = new RegionData();
		//The index 6, is currently the unselect,
		//this is *not good*
		if(this.getToolIndex() === 6) {
			//Clean up
			//TODO: We need to have callbacks for this
			//I have littered the code with
			//too much rubbish

			this.onRegion();
			this.state.regionList
				.cleanupIntersections(oldBuffer);
			this.triggerUpdate();
		} else {
			const rkey = this.toolToRegionKey();
			if(rkey) {
				this.onRegion();
				
				this.state.regionList
					.addData(oldBuffer, rkey);
				//Trigger a resolution here
				//
				this.state.regionList
					.resolveConnectionsForAll();
				console.log(this.state.
					    regionList);
				this.triggerUpdate();
			}
		}
	}

	undoRegion() {
		let res = this.regionStack.undoAction(
			this.state.regionList
		);
		if(res) {
			this.state.regionList = res;
			this.triggerUpdate()
		}
		
	}

	redoRegion() {
		let res = this.regionStack.redoAction(
			this.state.regionList
		);
		if(res) {
			this.state.regionList = res;
			this.triggerUpdate()
		}
		
	}

	onRegion() {
		this.regionStack.onAction(
			this.state.regionList.cloneList()
		);
	}

	/**
	 * Saves a project by triggering a service
	 * event, this event is triggered by GlobalBar
	 */
	saveProject() {
		RottnestService.SaveToLocalStorage('rottnest', 
					this.state.projectDetails);	
	}


	/**
	 * Loads a project by triggering a service event,
	 * this event is triggered by GlobalBar
	 */
	loadProject(project: string) {
		RottnestService.LoadFromLocalStorage(project);
	}

	/**
	 * Retrieves the current tool index that
	 * has been selected
	 */
	getToolIndex() {
		return this.state.appStateData.componentData
			.selectedTool;
	}

	/**
	 * Creates a settings form component that
	 * will allow the user to update project details
	 *
	 */
	showSettings() {

		this.state.appStateData.settingsActive = true;
		this.triggerUpdate();
	}
	
	showNewProject() {

		this.state.appStateData.newProjectActive = true;
		this.triggerUpdate();
	}

	/**
	 * Updates the state and triggers a
	 * re-render
	 */
	triggerUpdate() {	
		const newState = {...this.state};
		this.setState(newState);
	}

	/**
	 * Creates a settings form component that
	 * will allow the user to update project details
	 *
	 */
	cancelSettings() {
		this.state.appStateData.settingsActive = false;
		this.triggerUpdate();
	}

	cancelNewProject() {
		this.state.appStateData.newProjectActive = false;
		this.resetData();
		this.triggerUpdate();
	}

	/**
	 * Takes the project from settings and writes it
	 * to the save buffer
	 */
	applySettings(project: ProjectDetails) {
		this.state.projectDetails = project;	
		this.state.appStateData.settingsActive = false;

		const newState = {...this.state};
		const dspace = this.monitorComponent.designSpace;
		if(dspace) {
			dspace.redoCells(newState.projectDetails.width,
				newState.projectDetails.height);
		}
		this.setState(newState);

	}

	applyNewProject(project: ProjectDetails) {
		this.resetData();
		this.state.projectDetails = project;	
		this.state.appStateData.settingsActive = false;
		this.state.appStateData.newProjectActive = false;
		
		const newState = {...this.state};
		const dspace = this.monitorComponent.designSpace;
		if(dspace) {
			dspace.redoCells(newState.projectDetails.width,
				newState.projectDetails.height);
		}
		this.setState(newState);
	}

	/**
	 * Modifies the zoomIn and zoomOut
	 * TODO: Bug with zoom-ing and breaking the grid gap
	 */
	zoomIn(perc: number) {
		
		if((this.state.appStateData.zoomValue + perc) <= 400) {
			this.state.appStateData.zoomValue += perc;	
			this.triggerUpdate();
		}
	}

	/**
	 * Modifies the zoomIn and zoomOut
	 * TODO: Bug with zoom-ing and breaking the grid gap
	 */
	zoomOut(perc: number) {
		if((this.state.appStateData.zoomValue - perc) > 0) {
			this.state.appStateData.zoomValue -= perc;		
			this.triggerUpdate();
		}
	}

	resetDSMove() {
		const dspace = this.monitorComponent.designSpace;
		if(dspace) {
			dspace.onMiddleUp();
		}
	}
	
	render() {
		const rottContainer = this;
		const updateables = new Map();
		const toolKind = 0;
		const zoomValue = this.state.appStateData.zoomValue;
		
		const settingsisActive = !this.state.appStateData
			.settingsActive;
		const newProjectActive = this.state.appStateData
			.newProjectActive;


		const newProjectElement = newProjectActive ? 
			<NewProjectForm rootContainer={rottContainer}
				/> :
			<></>
		
		updateables.set(100, [`${zoomValue}%`, rottContainer]);

		return (
			<div className={styles.rottnest}>
				<SettingsForm rootContainer={
					rottContainer}
					isHidden={settingsisActive} 
					projectDetails={this.state
						.projectDetails}
					/>
				{newProjectElement}

				<GlobalBar componentMap={updateables}
				container={rottContainer} />

				<WorkspaceContainer 
					designSpace={
						{
						width: 
						this.state
						.projectDetails
							.width,
						height: 
						this.state
						.projectDetails
							.height,
						}
					}
					zoomValue={zoomValue}
					container={rottContainer}
					toolKind={toolKind} />
			</div>
		)
	}
}

export default RottnestContainer;
