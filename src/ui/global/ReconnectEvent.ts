import AppServiceModule from "../../net/AppServiceModule"
import RottnestContainer from "../container/RottnestContainer"

const leftClick = (_: RottnestContainer) => { 
	const appService = AppServiceModule.GetAppServiceInstance();
	appService.reconnect();
}

const auxEvent = (_: RottnestContainer) => { }


export default { leftClick, auxEvent }
