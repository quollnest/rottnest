
import {ProjectAssembly, ProjectDetails} from '../../model/Project';
import {RegionDataList } from '../../model/RegionDataList';
import {RunResultBuffer} from '../../model/RunResult.ts';
import { ContainerSchema } from './Schema.ts';
import { RouterAggr } from '../../net/Messages';
import { RottnestKindMap } from '../../model/RegionKindMap';
import { RottCallGraph, RottCallGraphDefault } from '../../model/CallGraph';
import { AppServiceClient } from '../../net/AppService';
import AppServiceModule from '../../net/AppServiceModule';
import RottnestContainer from '../container/RottnestContainer.tsx';
import { ValidationExecutor } from '../../vald/Validation.ts';


export type AppCommData = {
	appService: AppServiceClient

}

type TabViewStateData = {	
	selectedTabIndex: number
	tabNames: Array<string>
	availableTabs: Array<boolean>
}

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
		selectedSubTool: number
		selectedRegion: number
		selectedRegionType: string | null 
	}
}

/**
 * Maintains state information related to
 * rendering and data
 */
export type RottnestState = {
	projectDetails: ProjectDetails
	appStateData: RottnestAppState
	regionList: RegionDataList
	subTypes: RottnestKindMap
	routerList: Map<string, RouterAggr>
	tabData: TabViewStateData
	subTypesRecvd: boolean
	visData: any
	routerListRcvd: boolean
	selectedRouterIndex: number
	errorDisplay: boolean
	errorMessage: string
	graphViewData: RottCallGraph
	rrBuffer: RunResultBuffer
	valexec: ValidationExecutor
	
}

/**
 * Aggregate data container
 * Currently only one field that will hold the data
 */
type RottnestContainerAggr = {
  rtstate: RottnestState
  rtcommdata: AppCommData
  rtsubkinds: RottnestKindMap
}

/**
 * List of subkinds, subkinds get reported from the
 * backend
 */
let RottnestSubKinds: RottnestKindMap = {
	bus: [{ name: 'Not Selected' }],	
	register: [{ name: 'Not Selected'}],
	bellstate: [{ name: 'Not Selected'}],
	factory: [{ name: 'Not Selected'}],
	buffer: [{ name: 'Not Selected' }]	
}

/**
 * RTCommData, used to hold onto the service
 * instance as there is only going to be one
 * socket/pipe in use.
 */
const RTCommData: AppCommData = {
		appService: AppServiceModule
			.GetAppServiceInstance()
};

/**
 * Defaults around the rottnest state
 * data, will be used in part to initialise
 * the project data and other buffers as necessary
 */
const RTStateDefault: RottnestState = 
{
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
			componentData: {
				selectedTool: 0,
				selectedSubTool: 0,
				selectedRegion: -1,
				selectedRegionType: null
			},
		},		
		tabData: {
			selectedTabIndex: 0,
			availableTabs: [true, false, true, false],
			tabNames: ['Architecture', 'Call Graph', 
				'Visualiser', 'Run Chart']
		},
		graphViewData: RottCallGraphDefault(),	
		visData: {},
		rrBuffer: new RunResultBuffer(),
		valexec: ValidationExecutor.Make()
};


export type RottnestContainerOperations = {
  validate: (rtc: RottnestContainer) => void
}

export class RottnestContainerSchema implements ContainerSchema<
  RottnestContainerAggr,
  RottnestContainerOperations> {

  data: RottnestContainerAggr = RottnestContainerSchema.DataDefaults();

	/**
	 * Returns defaults of the data that will represent
	 * the state objects, commdata and subkinds
	 */
  static DataDefaults(): RottnestContainerAggr {
    return {
			rtstate: RTStateDefault,
			rtcommdata: RTCommData,
			rtsubkinds: RottnestSubKinds
    }
  }

  getDefaults(): RottnestContainerAggr {
    return {
        rtstate: { ...RTStateDefault },
        rtcommdata: { ...RTCommData },
        rtsubkinds: { ...RottnestSubKinds }
    };
  }

	/**
	 * Will return an aggregate object with
	 * state, commdata and subkinds
	 */
  getData(): RottnestContainerAggr {
    return this.data;
  }

	/**
	 * Returns a set of operations that will
	 * operate on the container
	 */
  getOperations(): RottnestContainerOperations {
    return {

			/**
			 * Validates the project assembly against the validation
			 * ruleset implemented
			 * The ruleset 
			 */
    	validate: (rtc: RottnestContainer) => {
				const valexec = rtc.state.valexec;
				const projasm = rtc.getProjectAssembly();

				valexec.localOnly(projasm);
    		
    	}
    };
  }
  
}


