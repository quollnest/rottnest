import ArchConverter from "../../util/ArchConverter";
import RottnestContainer from "../container/RottnestContainer"
import { RottArchMSG } from "../../net/Messages";


const leftClick = (container: RottnestContainer) => {
	const rottContainer = container;
	const appService = rottContainer.commData.appService;
	const projAssembly = rottContainer.getProjectAssembly();
	const tschedProject 
		= ArchConverter.ToTSched(projAssembly);
	
	if(tschedProject) {	
		appService.submitArch(
			new RottArchMSG(tschedProject))
	}
}

const auxEvent = (_: RottnestContainer) => { }

export default { leftClick, auxEvent }
