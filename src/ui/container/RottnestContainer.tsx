import React from 'react';
import GlobalBar from '../GlobalBar';

import WorkspaceContainer from './DesignerContainer.tsx';
import SettingsForm from './SettingsForm';
import NewProjectForm from './NewProjectForm';
import ErrorDisplay from './ErrorDisplay.tsx';
import HelpService from '../help/HelpService';  
import VisData from '../vis/VisData.ts';
import AppServiceModule from '../../net/AppServiceModule.ts';

import { RegionsSnapshotStack } 
	from '../../model/RegionSnapshotStack';
import { DesignSpace } from '../DesignSpace';
import { RouterAggr} from '../../net/Messages.ts';
import { HelpContainer } from './HelpContainer.tsx';
import { RottCallGraphDefault } from '../../model/CallGraph.ts';
import { AppCommData, RottnestContainerOperations, RottnestContainerSchema, RottnestState } from '../schema/RottnestContainerSchema.ts';
import { HelpDataCollection, HelpUISchema } from '../schema/HelpUISchema.ts';
import { CommOpQueue, CommsActions } from '../schema/ops/CommsOps.ts';
import { RTCCommActions, RTCOpenOperations } from '../schema/ops/RTCCommsOps.ts';
import { RottnestKindMap, SubKind } 
	from '../../model/RegionKindMap.ts'
import {ProjectDetails, ProjectAssembly, ProjectDump } from '../../model/Project';
import {RegionDataList } from '../../model/RegionDataList';
import { RegionCell, RegionData, Regions } 
	from '../../model/RegionData';


import styles from '../styles/RottnestContainer.module.css';


/**
 * At the moment, nothing interesting
 */
type RottnestProperties = {};








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
class RottnestContainer extends React.Component<RottnestProperties, RottnestState> {

	rtcCommsActions: CommsActions<RottnestContainer>
		= RTCCommActions;
	rtcCommsDispatch: CommOpQueue<RottnestContainer>
		= RTCOpenOperations;
	
	schemaData: RottnestContainerSchema
		= new RottnestContainerSchema();
	
	commData: AppCommData = this.schemaData
		.getData()
		.rtcommdata;

	helpData: HelpDataCollection
		= HelpUISchema.DataDefaults();

	opers: RottnestContainerOperations = this.schemaData.getOperations();

  /*state: RottnestState = {
		projectDetails: {
			projectName: 'Project1', 
			author: 'User',
			width: 20,
			height: 20,
			description: 'Quick Description'
		},
		regionList: new RegionDataList(),
		subTypes: RottnestSubKinds,	
		routerList: new Map(),
		subTypesRecvd: false,
		routerListRcvd: false,
		selectedRouterIndex: 0,
		errorMessage: '',
		errorDisplay: false,
		appStateData: {
			settingsActive: false,
			newProjectActive: false,
			zoomValue: 100,
			colourblindActive: false,
			helpActive: false,
			tourMode: false, 
       	 		tourStep: 0,
			componentData: {
				selectedTool: 0,
				selectedSubTool: 0,
				selectedRegion: -1,
				selectedRegionType: null
			},
		},		
		tabData: {
			selectedTabIndex: 0,
			availableTabs: [true, false, false, false],
			tabNames: ['Architecture', 'Call Graph', 
				'Visualiser', 'Run Chart']
		},
		graphViewData: RottCallGraphDefault(),	
		visData: {},
		rrBuffer: new RunResultBuffer()
	};
		},*/


	state: RottnestState = this.schemaData
		.getData()
		.rtstate;
	
	regionStack: RegionsSnapshotStack = 
		new RegionsSnapshotStack();
	currentRDBuffer: RegionData = 
		new RegionData();

	constructor(props: RottnestProperties) {
		super(props);
	}

	closeError() {
		this.state.errorDisplay = false;
		this.triggerUpdate();
	}
	
	getRRBuffer() {
		return this.state.rrBuffer;
	}

	readyAppService() {
		const appReady = AppServiceModule
			.ConnectionReady();
		const appService = AppServiceModule
			.GetAppServiceInstance();
		const selfRef = this;
		
		if(appReady) { return; }

		selfRef.rtcCommsActions.ApplyInternal(
			selfRef.commData.appService, selfRef);

		appService.registerOpenFn(() => { selfRef
			.rtcCommsDispatch.applyAll(appService, selfRef); });
		
		this.commData.appService.connect();

	}

	getVisData() {
		return this.state.visData.vis_obj;
	}

	gotoVizWithData(data: any) {
		console.log(data);
		this.state.tabData.selectedTabIndex = 2;
		this.state.tabData.availableTabs[2] = true;
		//this.state.visData = data; //Causing issues
		this.triggerUpdate();
	}

	getProjectAssembly(): ProjectAssembly {
		return {
			projectDetails: this.state
				.projectDetails,
			regionList: this.state.regionList
		}
	}

	async componentDidMount() {
		this.readyAppService();

		try {
			this.helpData = await HelpService.loadHelpData('en');
		} catch(err) {
			console.error("Failed to load help data:", err);
		}

		//const appService = AppServiceModule
		//	.GetAppServiceInstance();
		//if(!appService.isConnected()) {
		//	appService.connect();
			//TODO: Fix this ASAP, 
			//this is really gross
			//const appService = AppServiceModule
			//.GetAppServiceInstance();
					/*appService.sendMsg(
				JSON.stringify(
				{
					cmd: 'subtype',
				}));
			}*/

		//}
	}

	componentWillUnmount() {
  		if (this.state.appStateData.helpActive) {
    			document.removeEventListener('keydown', this.handleEscKey);
  		}
	}

	monitorComponent: ComponentMonitor = {
		designSpace: null,
		settingsForm: null
	}
	


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
		const selectedRegion = this
			.getSelectedRegionData();

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
						listIdx: 
							ar.ownIdx
						!== null ?
						ar.ownIdx : -1,
						connectorId: 
							idx+1,
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
	
	getCGGraph() {
		return this.state.graphViewData;
	}

	getRouterList() {
		return this.state.routerList;
	}

	getSelectedRouterIndex() {
		return this.state.selectedRouterIndex;
	}

	updateRouterList(routers: Map<string, RouterAggr>) {
		this.state.routerList = routers;
		this.state.routerListRcvd = true;
		this.opers.validate(this);
		this.triggerUpdate();
	}


	updateSubTypes(subTypes: RottnestKindMap) {
		this.state.subTypes = subTypes;
		this.state.subTypesRecvd = true;
		this.opers.validate(this);
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
	
	toggleHelp() {
  		const helpActive = !this.state.appStateData.helpActive;

  		this.setState({
    			appStateData: {
      				...this.state.appStateData,
      				helpActive,
      				tourMode: false
    			}
  		});

		if (helpActive) {
    			document.addEventListener('keydown', this.handleEscKey);
  		} else {
    			document.removeEventListener('keydown', this.handleEscKey);
  		}
	}

	handleEscKey = (event: KeyboardEvent) => {
  		if (event.key === 'Escape' && this.state.appStateData.helpActive) {
    			this.toggleHelp();
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
			console
			.error("Unable set current region");
		}
	}
	
	getSubTypesAndSelected(): 
		{ 
			subTypes: Array<SubKind>
			selectedSubTypeTool: number
		}{
		const keyObj = this.toolToRegionKey();
		if(keyObj) {
		const key = RegionData.SingularKind(
			keyObj) as keyof RottnestKindMap;

		//TODO: You are apparently a map?

		if(key !== null) {
			return {
				subTypes: this.state
					.subTypes[key]
					.map((e) => 
					{ return (
						{ name: e.name }) 
					}),
				selectedSubTypeTool: this.state
					.appStateData
					.componentData
					.selectedSubTool
				}
			}
		} 
		return {
			subTypes: [
				{ name: 'Not Selected' }
			],	
			selectedSubTypeTool: this.state
				.appStateData
				.componentData
				.selectedSubTool
		}

	}

	//TODO: Funny method, subTypes and selected might be
	//messing with things
	getRegionListData() {
		return {
			regionList: this.state.regionList,
			selectedIdx: this.state.appStateData
				.componentData
				.selectedRegion,
			selectedKind: this.state.appStateData
				.componentData
				.selectedRegionType,
			subTypes: this.state.subTypes,
			connectionRecs: [{name: 'None/Invalid', 
				connectorId: 0}]
		}
	}
	

	updateSelectedSubType(subTypeIndex: number) {
		this.state.appStateData
			.componentData
			.selectedSubTool = subTypeIndex;
		this.opers.validate(this);
		this.triggerUpdate();
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
			this.opers.validate(this);
			this.triggerUpdate();
		} else {
			//reset
			this.state.appStateData.componentData
			.selectedRegion 
				= -1; 
			this.state.appStateData.componentData
			.selectedRegionType 
				= null;
			this.opers.validate(this);
			this.triggerUpdate();

		}
	}

	getSelectedRegionData(): RegionData | null {
		const getSelectedIdx = this.state.appStateData
			.componentData.selectedRegion;
		const selKey = this.state.appStateData
			.componentData.selectedRegionType 
			!== null ?
			this.state.appStateData
			.componentData.selectedRegionType  
				: 'NA';
		const getSelectedKeyStr = RegionData
			.PluraliseKind(
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

	updateSelectedRegionDataNoUpdate(regData: RegionData) {
		const getSelectedIdx = this.state.appStateData
			.componentData.selectedRegion;

		const getSelectedKeyStr = this.state.appStateData
			.componentData.selectedRegionType;
		this.getRegionList()
			.updateByIdx(getSelectedKeyStr, 
				     getSelectedIdx, 
				     regData);
	}

	updateSelectedRegionData(regData: RegionData) {
		this.updateSelectedRegionDataNoUpdate(regData);
		this.opers.validate(this);
		this.triggerUpdate();
	}

	resetData() {
		this.state.regionList = new RegionDataList();
		//TODO: May want to check to see if this works
		this.state.appStateData = this.schemaData.getDefaults().rtstate.appStateData;
		this.state.tabData = {
			selectedTabIndex: 0,
			availableTabs: [true, false, false, false],
			tabNames: ['Architecture', 'Call Graph', 
				'Visualiser', 'Run Chart']
		};
		this.state.graphViewData = RottCallGraphDefault(),	
		this.state.visData = VisData.empty();
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
						partialDump
						.project 
						!= null ?
						jsonRep.project :
						this.state
						.projectDetails,
					regions:
						partialDump
						.regions
						!= null ?
						jsonRep.regions :
						this.state
						.regionList
				}
				this.state.projectDetails =
					dump.project;
				this.state.regionList = 
					RegionDataList
					.fromFlatten(
						dump.regions);
				
				const newState = {...this.state};
				const dspace = this
					.monitorComponent
					.designSpace;
				if(dspace) {
					dspace.redoCells(newState
						.projectDetails
						.width,
						newState
						.projectDetails
						.height);
				}
				this.setState(newState);

				//this.triggerUpdate();
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
	
	static ToolNumberToRegionKey(tnum: number)
		: string | null {
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
		const oldBuffer: RegionData = 
			this.currentRDBuffer;
		this.currentRDBuffer = new RegionData();
		//The index 6, is currently the unselect,
		//this is *not good*
		if(this.getToolIndex() === 6) {
			//Clean up
			//TODO: We need to have callbacks 
			//for this
			//I have littered the code with
			//too much rubbish

			this.onRegion();
			this.state.regionList
				.cleanupIntersections(oldBuffer);
			this.opers.validate(this);
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

				let kindex = this.state
				.appStateData
				.componentData.selectedSubTool;


				if(kindex === 0) {
					kindex = (subkindFor
						  .length-1)
					 % subkindFor.length;
				}

				const kSubKindDefault 
				= subkindFor[kindex];
				
				
				oldBuffer.setSubKind(
					kSubKindDefault.name);

				this.onRegion();
					
				this.state.regionList
					.addData(oldBuffer, 
						 rkey);
				
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
					.updateSelectedRegion(x,
							      y);
					
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
			this.opers.validate(this);
			this.triggerUpdate();
		}
		
	}

	redoRegion() {
		let res = this.regionStack.redoAction(
			this.state.regionList
		);
		if(res) {
			this.state.regionList = res;
			this.triggerUpdate();
		}
		
	}

	onRegion() {
		this.regionStack.onAction(
			this.state.regionList.cloneList()
		);
	}



	/**
	 * Retrieves the current tool index that
	 * has been selected
	 */
	getToolIndex() {
		return this.state.appStateData.componentData
			.selectedTool;
	}

	getSubToolIndex() {
		return this.state.appStateData
			.componentData.selectedSubTool;
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
		this.opers.validate(this);
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
			dspace.redoCells(newState
					 .projectDetails.width,
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
		const zoomValue = this.state
			.appStateData.zoomValue;
	
		const settingsisActive = !this.state.appStateData
			.settingsActive;
		const newProjectActive = this.state.appStateData
			.newProjectActive;

		const newProjectElement = newProjectActive ? 
			<NewProjectForm rootContainer={rottContainer}/> :
		<></>
	
		updateables.set(100, [`${zoomValue}%`, 
			rottContainer]);
	
		const errorComponent = this.state.errorDisplay ? 
			<ErrorDisplay message={this.state.errorMessage} 
				rootContainer={this} /> :
			<></>;
	
		// Help Componenet
		const helpComponent = this.state.appStateData.helpActive ?
  			<HelpContainer 
    				toggleOff={() => this.toggleHelp()}
    				helpData={this.helpData}
  			/> :
  		<></>;

		return (
			<div className={styles.rottnest}>
				<SettingsForm   rootContainer={rottContainer}
						isHidden={settingsisActive} 
						projectDetails={this.state.projectDetails}
				/>
				{newProjectElement}
				{errorComponent}
				{helpComponent}
			
				<GlobalBar 	componentMap={updateables}
						container={rottContainer} 
				/>
			
				<WorkspaceContainer 
						container={rottContainer}
				/>
			</div>
		)
	}
}

export default RottnestContainer;
