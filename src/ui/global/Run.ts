import {AppServiceClient, APP_URL} from "../../net/AppService"
import RottnestContainer from "../container/RottnestContainer"


const leftClick = (container: RottnestContainer) => {
	const rottContainer = container;
	const appService = rottContainer.commData.appService;
	appService.submitArch(null)
}

const auxEvent = (_: RottnestContainer) => { }


export default { leftClick, auxEvent }
