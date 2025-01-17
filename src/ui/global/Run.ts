import {TSchedData} from "../../model/TSchedData";
import {RottArchMSG, RottRunResultMSG} from "../../net/Messages";
import ArchConverter from "../../util/ArchConverter";
import RottnestContainer from "../container/RottnestContainer"

const IS_DEBUG: boolean = false;

const leftClick = (container: RottnestContainer) => {
	const rottContainer = container;
	const appService = rottContainer.commData.appService;
	const projAssembly = rottContainer.getProjectAssembly();
	const tschedProject = ArchConverter.ToTSched(projAssembly);
	if(tschedProject) {	
		appService.submitArch(new RottArchMSG(tschedProject))
	}
	if(IS_DEBUG) {
		let tschedProject: TSchedData = {
			width: 0,
			height: 0,
			regions: []
		};
		appService.submitArch(new RottArchMSG(tschedProject))
	}
}

const auxEvent = (_: RottnestContainer) => { }


export default { leftClick, auxEvent }
