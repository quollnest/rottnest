
import {ProjectDetails} from '../../model/Project';
import {RegionDataList } from '../../model/RegionDataList';
import {RunResultBuffer} from '../../model/RunResult.ts';
import { ContainerSchema } from './Schema.ts';
import { RouterAggr } from '../../net/Messages';
import { RottnestKindMap } from '../../model/RegionKindMap';
import { RottCallGraph, RottCallGraphDefault } from '../../model/CallGraph';
import { AppServiceClient } from '../../net/AppService';
import AppServiceModule from '../../net/AppServiceModule';


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

let RottnestSubKinds: RottnestKindMap = {
	bus: [{ name: 'Not Selected' }],	
	register: [{ name: 'Not Selected'}],
	bellstate: [{ name: 'Not Selected'}],
	factory: [{ name: 'Not Selected'}],
	buffer: [{ name: 'Not Selected' }]	
}


const RTCommData: AppCommData = {
		appService: AppServiceModule
			.GetAppServiceInstance()
};

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
			availableTabs: [true, false, false, false],
			tabNames: ['Architecture', 'Call Graph', 
				'Visualiser', 'Run Chart']
		},
		graphViewData: RottCallGraphDefault(),	
		visData: {},
		rrBuffer: new RunResultBuffer()
};


export type RottnestContainerOperations = {

  
}

export class RottnestContainerSchema implements ContainerSchema<
  RottnestContainerAggr,
  RottnestContainerOperations> {

  data: RottnestContainerAggr = RottnestContainerSchema.DataDefaults();

  static DataDefaults(): RottnestContainerAggr {
    return new RottnestContainerSchema().getData();
  }

  getDefaults(): RottnestContainerAggr {

    return {
        rtstate: RTStateDefault,
        rtcommdata: RTCommData,
        rtsubkinds: RottnestSubKinds
    };
  }

  getData(): RottnestContainerAggr {
    return this.data;
  }

  getOperations(): RottnestContainerOperations {
    return {};
  }
  
}


