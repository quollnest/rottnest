import React from 'react';
import GlobalBar from '../GlobalBar';
import RottnestService from '../../service/RottnestService';
import {RottnestProject, ProjectDetails, RegionData, 
	RegionDataList, Regions,
	ProjectDump} 
	from '../../model/Project';
import WorkspaceContainer from './RowContainer';
import SettingsForm from './SettingsForm';

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
 * This allows for undo and redo functionality
 * within the container system
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
 * Maintains state information related to
 * rendering and data
 */
type RottnestState = {
	projectDetails: ProjectDetails
	settingsActive: boolean
	zoomValue: number
	regionList: RegionDataList
}

/**
 * Container for the main application
 * Will be a single page with a number of different
 * components rendered underneath it
 *
 */
class RottnestContainer extends React.Component<RottnestProperties, RottnestState> {

	state: RottnestState = {
		projectDetails: {
			projectName: 'Project1', 
			author: 'User',
			width: RottnestDefault.designSpace.width,
			height: RottnestDefault.designSpace.height,
			description: 'Quick Description'	
		},
		settingsActive: false,
		zoomValue: 100,
		regionList: new RegionDataList()
	};

	regionStack: RegionsSnapshotStack = new RegionsSnapshotStack();
	currentRDBuffer: RegionData = new RegionData();

	data: RottnestData = {
		toolboxData: {...RottnestDefault.toolbox},
		regionListData: {...RottnestDefault.regionList},
		errorListData: {...RottnestDefault.errorList},
		designSpaceData: {...RottnestDefault.designSpace},
		project: new RottnestProject(),
		selectedIndex: 0,
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
				this.state.regionList.regions = 
					dump.regions.regions;
				

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

	applyRDBuffer() {
		const oldBuffer = this.currentRDBuffer;
		this.currentRDBuffer = new RegionData();
		const rkey = this.toolToRegionKey();
		if(rkey) {
			this.onRegion();
			this.state.regionList
				.addData(oldBuffer, rkey)
			this.triggerUpdate();
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
					this.data.project);	
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
		return this.data.selectedIndex;
	}

	/**
	 * Creates a settings form component that
	 * will allow the user to update project details
	 *
	 */
	showSettings() {
		this.state.settingsActive = true;
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
		this.state.settingsActive = false;
		this.triggerUpdate();
	}

	/**
	 * Takes the project from settings and writes it
	 * to the save buffer
	 */
	applySettings(project: ProjectDetails) {
		//TODO: Implement a write 
		//buffer that will be used during
		//save
		this.state.projectDetails = project;	
		this.state.settingsActive = false;
		this.triggerUpdate();
	}

	/**
	 * Modifies the zoomIn and zoomOut
	 * TODO: Bug with zoom-ing and breaking the grid gap
	 */
	zoomIn(perc: number) {
		
		if((this.state.zoomValue + perc) <= 250) {
			this.state.zoomValue += perc;	
			this.triggerUpdate();
		}
	}

	/**
	 * Modifies the zoomIn and zoomOut
	 * TODO: Bug with zoom-ing and breaking the grid gap
	 */
	zoomOut(perc: number) {
		if((this.state.zoomValue - perc) > 0) {
			this.state.zoomValue -= perc;		
			this.triggerUpdate();
		}
	}


	render() {
		const rottContainer = this;
		const updateables = new Map();
		const toolKind = 0;
		const zoomValue = this.state.zoomValue;
		
		const settings = this.state.settingsActive ? 
			<SettingsForm isHidden={false} 
				rootContainer={rottContainer} /> 
				: <></>;
		
		updateables.set(100, [`${zoomValue}%`, rottContainer]);

		return (
			<div className={styles.rottnest}>
				{settings}
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
