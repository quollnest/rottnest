import React from 'react';
import GlobalBar from '../GlobalBar';
import RottnestService from '../../service/RottnestService';
import {ProjectDetails, 
	RegionDataList,
	ProjectDump,
	ProjectAssembly} 
	from '../../model/Project';
import { RegionCell, RegionData, Regions } from '../../model/RegionData';
import WorkspaceContainer from './RowContainer';
import SettingsForm from './SettingsForm';

import { RegionsSnapshotStack } from '../../model/RegionSnapshotStack';

import styles from '../styles/RottnestContainer.module.css';
import {DesignSpace} from '../DesignSpace';
import NewProjectForm from './NewProjectForm';
import { RottnestKindMap } from '../../model/KindMap.ts'
import {AppServiceClient} 
	from '../../net/AppService.ts';
import AppServiceModule from '../../net/AppServiceModule.ts';
import {RottRunResultMSG} from '../../net/Messages.ts';

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
		selectedRegionType: string | null 
	}
}


let RottnestSubKinds: RottnestKindMap = {
	bus: [{ name: 'Not Selected' }],	
	register: [{ name: 'Not Selected'}],
	bellstate: [{ name: 'Not Selected'}],
	factory: [{ name: 'Not Selected'}],
	buffer: [{ name: 'Not Selected' }]	
}


/**
 * Maintains state information related to
 * rendering and data
 */
type RottnestState = {
	projectDetails: ProjectDetails
	appStateData: RottnestAppState
	regionList: RegionDataList
	subTypes: RottnestKindMap
	tabData: TabViewStateData
	subTypesRecvd: boolean
	visData: any
}

type ComponentMonitor = {
	designSpace: DesignSpace | null
	settingsForm: SettingsForm | null
}

type AppCommData = {
	appService: AppServiceClient

}

type TabViewStateData = {	
	selectedTabIndex: number
	tabNames: Array<string>
	availableTabs: Array<boolean>
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

	commData: AppCommData = {
		appService: AppServiceModule
			.GetAppServiceInstance()
	}

	state: RottnestState = {
		projectDetails: {
			projectName: 'Project1', 
			author: 'User',
			width: 20,
			height: 20,
			description: 'Quick Description'
		},
		regionList: new RegionDataList(),
		subTypes: RottnestSubKinds,	
		subTypesRecvd: false,
		appStateData: {
			settingsActive: false,
			newProjectActive: false,
			zoomValue: 100,
			colourblindActive: false,
			helpActive: false,
			componentData: {
				selectedTool: 0,
				selectedRegion: -1,
				selectedRegionType: null
			},
		},		
		tabData: {
			selectedTabIndex: 0,
			availableTabs: [true, false, false],
			tabNames: ['Architecture', 'Widget', 
				'Visualiser']
		},
		visData: {}
	};
	
	regionStack: RegionsSnapshotStack = 
		new RegionsSnapshotStack();
	currentRDBuffer: RegionData = 
		new RegionData();

	constructor(props: RottnestProperties) {
		super(props);
		const selfRef = this;
		const appService = this.commData.appService;
		appService.registerReciverKinds(
			'subtype', (_) => {
				let kinds = appService
					.retrieveSubTypes();
				if(kinds) {
					selfRef.updateSubTypes(kinds);
				}
			}
		);
		appService.registerReciverKinds(
			'use_arch', (_) => {
				let someMsg = appService.dequeue();
				let arch_id = someMsg?.getJSON();
				appService.runResult(
					new RottRunResultMSG(arch_id));
			}
		);
		appService.registerReciverKinds(
			'err', (_) => {
				let someMsg = appService.dequeue();

				let json = someMsg?.getJSON();
				console.error(json);
			}
		);;
		appService.registerReciverKinds(
			'run_result', (_) => {
				let someMsg = appService.dequeue();
				
				let json = someMsg?.getJSON();
				selfRef.state.visData = json;
				selfRef.state.tabData.availableTabs[2]
					= true;
				selfRef.triggerUpdate();
			}
		);
	}

	getProjectAssembly(): ProjectAssembly {
		return {
			projectDetails: this.state.projectDetails,
			regionList: this.state.regionList
		}
	}

	componentDidMount() {

		const appService = AppServiceModule
			.GetAppServiceInstance();
		if(!appService.isConnected()) {
			appService.connect();
		}
	}

	monitorComponent: ComponentMonitor = {
		designSpace: null,
		settingsForm: null
	}
	

	//Methods

	/**
	 * Calls into the selected region and retrieves the
	 * list of adjacent regions that it can manually set
	 */
	getValidAdjacentsOfSelected() {
		const adjacentList = [
			{
				name: "Not Selected",
				listIdx: -1,
				connectorId: 0,
				direction: 0
			}
		]
		const regionList = this.state.regionList;
		const selectedRegion = this.getSelectedRegionData();

		if(selectedRegion) {
			const edges = selectedRegion.edgeAABBs();
			const aregs = this.state.regionList
				.discoverFromEdges(edges);
			const selKind = selectedRegion.getKind();
			adjacentList	
				.push(...aregs.map((ar, idx) =>{
					const kindP = RegionData
						.PluraliseKind(ar
							.regionData
						       .getKind())
					return ({
						name: kindP,
						listIdx: ar.ownIdx 
						!== null ?
							ar.ownIdx : -1,
						connectorId: idx+1,
						direction: ar.dir
					})
				})
				.filter((ar, _) => {
					return regionList
						.canConnectToKind(
							selKind, 
							ar.name);
				}));
		} 
		return adjacentList;
	}

	updateSubTypesFromService() {
		const apserv = this.commData.appService;
		apserv.retrieveSubTypes();
	}

	updateSubTypes(subTypes: RottnestKindMap) {
		this.state.subTypes = subTypes;
		this.state.subTypesRecvd = true;
		this.triggerUpdate();
	}
	
	deleteSelectedRegion(kind: string, idx: number) {

		const selectedObj = this.getRegionList()
			.retrieveByIdx(kind, idx);
		if(selectedObj) {
			//1. Add onto the undo stack
			this.onRegion();
			
			//2. Delete
			selectedObj.markAsDead();	
		}
	}

	selectCurrentRegion(kind: string, idx: number) {
		const selectedObj = this.getRegionList()
			.retrieveByIdx(kind, idx);
		if(selectedObj) {
			this.state.appStateData.componentData
				.selectedRegion = idx;
			this.state.appStateData.componentData
				.selectedRegionType = kind;
			
			this.triggerUpdate();
		} else {
			console.error("Unable set current region");
		}
	}

	//TODO: Funny method, subTypes and selected might be
	//messing with things
	getRegionListData() {
		return {
			regionList: this.state.regionList,
			selectedIdx: this.state.appStateData
				.componentData.selectedRegion,
			selectedKind: this.state.appStateData
				.componentData.selectedRegionType,
			subTypes: this.state.subTypes,
			connectionRecs: [{name: 'None/Invalid', 
				connectorId: 0}]
		}
	}
	
	updateSelectedRegion(x: number, y: number) {
		const aggrData = this.state.regionList
			.getRegionDataFromCoords(x, y); 

		if(aggrData) {
			this.state.appStateData.componentData
			.selectedRegion 
				= aggrData.regIdx
			this.state.appStateData.componentData
			.selectedRegionType 
				= RegionData.PluraliseKind(
					aggrData.kind);
			this.triggerUpdate();
		} else {
			//reset
			this.state.appStateData.componentData
			.selectedRegion 
				= -1; 
			this.state.appStateData.componentData
			.selectedRegionType 
				= null;			
			this.triggerUpdate();

		}
	}

	getSelectedRegionData(): RegionData | null {
		const getSelectedIdx = this.state.appStateData
			.componentData.selectedRegion;
		const selKey = this.state.appStateData
			.componentData.selectedRegionType !== null ?
			this.state.appStateData
			.componentData.selectedRegionType  : 'NA';
		const getSelectedKeyStr = RegionData.PluraliseKind(
			selKey);


		return this.getRegionList()
			.retrieveByIdx(getSelectedKeyStr, 
			getSelectedIdx);
	}

	getRegionSelectionData(): [number, string | null] {
		return [
			this.state.appStateData.componentData
			.selectedRegion,
			this.state.appStateData.componentData
			.selectedRegionType,
		]

	}

	updateSelectedRegionData(regData: RegionData) {
		const getSelectedIdx = this.state.appStateData
			.componentData.selectedRegion;

		const getSelectedKeyStr = this.state.appStateData
			.componentData.selectedRegionType;
		console.log(getSelectedIdx, getSelectedKeyStr, regData);
		this.getRegionList()
			.updateByIdx(getSelectedKeyStr, 
				     getSelectedIdx, 
				     regData);

		this.triggerUpdate();
	}

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
				selectedRegion: 0,
				selectedRegionType: null
			},
		};
		this.state.tabData = {
			selectedTabIndex: 0,
			availableTabs: [true, false, false],
			tabNames: ['Architecture', 'Widget', 
				'Visualiser']
		};
		this.state.visData = {};
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

		const rtag = RottnestContainer
			.ToolNumberToRegionKey(this
				.getToolIndex());
		if(rtag !== null) {
			return rtag as keyof Regions;
		}
		return null;
	}
	
	static ToolNumberToRegionKey(tnum: number): string | null {
		switch(tnum) {
			case 1:
				return 'buffers';
			case 2:
				return 'bus';
			case 3:
				return 'factories';
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
		const oldBuffer: RegionData = this.currentRDBuffer;
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
				const pkey = RegionData
					.SingularKind(rkey);
				const subkindFor 
				= this.state
				.subTypes[
				pkey as keyof RottnestKindMap];

				const kSubKindDefault 
				= subkindFor[(subkindFor.length-1)
				 % subkindFor.length];
				oldBuffer.setSubKind(
					kSubKindDefault.name);

				this.onRegion();
					
				this.state.regionList
					.addData(oldBuffer, rkey);
				
				this.state.regionList
				.resolveConnectionsFromTraversal(
						false);
				let res: RegionCell | undefined 
					= oldBuffer.cells
					.values()
					.next().value;
				if(res) {	
					const { x, y }: 
					{ x: number
					  y: number } 
						= res;	
					this
					.updateSelectedRegion(x, y);
					
				}
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
	 * TODO: Bug wih zoom-ing and breaking the grid gap
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
			dspace.resetMove();
		}
	}

	updateVisibility(region: RegionData, visible: boolean) {	
		region.setVisbility(visible);
		this.triggerUpdate();
	}

	updateSelectedTab(idx: number) {
		const tabs = this.state.tabData.tabNames;
		this.state.tabData.selectedTabIndex 
			= idx % tabs.length;
		this.triggerUpdate();
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
		
		//TODO: Fix this ASAP, this is really gross
		const appService = AppServiceModule
			.GetAppServiceInstance();
		if(!this.state.subTypesRecvd) {
			appService.sendMsg(JSON.stringify(
				{
					cmd: 'subtype',
				}));
		}
		
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
					selectedTab={this.state
						.tabData
						.selectedTabIndex}
					tabTitles={this.state
						.tabData
						.tabNames}
					availableTabs={this.state
						.tabData.availableTabs}
					zoomValue={zoomValue}
					container={rottContainer}
					toolKind={toolKind} />
			</div>
		)
	}
}

export default RottnestContainer;
