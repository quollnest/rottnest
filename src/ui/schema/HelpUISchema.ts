import RottnestContainer from "../container/RottnestContainer";
import { HelpBoxData } from "../container/HelpContainer";
import { ContainerSchema } from "./Schema";

export type HelpDataCollection = Array<HelpBoxData>;


export type HelpDataOperations = {
  toggleHelp: (rtc: RottnestContainer) => void
}


export class HelpUISchema
  implements ContainerSchema<HelpDataCollection, HelpDataOperations> {

  data: HelpDataCollection = HelpUISchema.DataDefaults();

  getOperations(): HelpDataOperations {
    return {
      /**
       * Triggers a help toggle on RottnestContainer
       * that will invert the help modal displayed
       */
      toggleHelp: (rtc: RottnestContainer) => {
    		const v = rtc.state.appStateData.helpActive; 
    		rtc.state.appStateData.helpActive = !v;
    		rtc.triggerUpdate();
      }
    }
  }

  getData(): HelpDataCollection {
    return this.data;
  }

  getDefaults(): HelpDataCollection {
    return HelpUISchema.DataDefaults();
  }

  
  static DataDefaults(): HelpDataCollection {
    return [
  		{
  			title: "Toolbox",
  			content: `
  			Tool used to mark different `+
  				`regions and select` +
  			`existing regions
  			`,
  			coords: [70, 70],

  		},
  		/*{
  			title: "Region List",
  			content: `
  			Lists the regions that have 
  			been marked
  			by the user
  			`,
  			coords: [550, 90],
  			rightPointer: true

  		},*/

  	];
  }
}

