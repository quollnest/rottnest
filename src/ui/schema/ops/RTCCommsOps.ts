import { AppServiceClient } from "../../../net/AppService";
import { RottRunResultMSG } from "../../../net/Messages";
import RottnestContainer from "../../container/RottnestContainer";
import { CommEventOps, CommsActions } from "./CommsOps";


/**
 *
 * RTCCommEvents is a collection of events that is relevant for the RottnestContainer
 * Separate events can be separated into another container or context type
 * That will be the focus.
 * 
 * 
 */
export const RTCCommEvents: CommEventOps<RottnestContainer> = {
  recvSubType: {
    evkey: 'subtype',
    evtrigger: (appService: AppServiceClient, rtc: RottnestContainer, m: any) => {
      let kinds = appService
				.retrieveSubTypes(m);
			if(kinds) {
				rtc.updateSubTypes(kinds);

				appService
				.sendObj('get_router'
				,'');
			}
		}
  },
  
  recvGetRouter: {
    evkey: 'get_router',
    evtrigger: (appService: AppServiceClient, rtc: RottnestContainer, m: any) => {
      let kinds = appService
					.retrieveRouters(
						rtc.state.subTypes,m);
				if(kinds) {
					rtc.updateSubTypes(kinds);
				}
		}
  },
  recvUseArch: {
    evkey: 'use_arch',
    evtrigger: (appService: AppServiceClient, _: RottnestContainer, m: any) => {
      let someMsg = m 
				if(someMsg) {
					let arch_id = someMsg
						.getJSON();
					appService.runResult(
					new RottRunResultMSG(
						arch_id));
				}
		  }
  },
  recvErr: {
    evkey: 'err',
    evtrigger: (_: AppServiceClient, rtc: RottnestContainer, m: any) => {
    
      let someMsg = JSON.stringify(m); 
			rtc.state.errorMessage = someMsg;
			rtc.state.errorDisplay = true;
			console.error(`Error occurred: ${someMsg}`);
			rtc.triggerUpdate();
		}
	},

  recvRunResult: {
    evkey: 'run_result',
    evtrigger: (_: AppServiceClient, rtc: RottnestContainer, m: any) => {
    
      //TODO Set the graph id for
			//the msg to be sent for
			//get_graph
			let rrBuf = rtc.getRRBuffer();

			let json = m.interpretedData; 
		
			//A lot of heavy lifting done with this
			//to address a terrible messaging system
			const [rkind, mdat] = rrBuf.decodeAndSort(json.payload);
			//appService
			//	.sendObj('get_graph','');
			
			let shouldUpdate = false;
			if(rkind === "CUIDObj" || rkind === "CUIDTotal") {
				rtc.state.tabData
				.availableTabs[3]
					= true;
				
				rtc.state.tabData
				.availableTabs[1]
					= true;
				shouldUpdate = true;
			}
			if(rkind === "VisualResult") {
				rtc.state.visData = mdat;
				rtc.state.tabData
				.availableTabs[2]
					= true;
				shouldUpdate = true;
			}
			if(shouldUpdate) {
				rtc.triggerUpdate();
			}
			//This needs to trigger
			//a retrieval on get_graph
		}
	},

  recvGetRootGraph: {
    evkey: 'get_root_graph',
    evtrigger: (appService: AppServiceClient, rtc: RottnestContainer, m: any) => {
      let graph = appService
				.decodeGraph(m);
			if(graph) {
				rtc.state.graphViewData
				= graph;
			}       
		}
	},

	recvGetArgs: {
    evkey: 'get_args',
    evtrigger: (_a: AppServiceClient, _r: RottnestContainer, _m: any) => {
      /*let kinds = appService
					.retrieveArgs(m);
				if(kinds) {
				selfRef
				.updateArgsList(kinds);
				
				}*/
		}
	  
	}
}

/**
 * CommunicationActions for RottnestContainer, allows one
 * to define it in a file and pass it to where it is needed
 */
export const RTCCommActions
  = CommsActions.MakeCommsWith<RottnestContainer>(RTCCommEvents);
