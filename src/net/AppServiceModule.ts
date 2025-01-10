import {AppServiceClient, APP_URL} from './AppService'


let appService: AppServiceClient | null = null 

function GetAppServiceInstance() {
	if(appService === null) {
		appService = new AppServiceClient(APP_URL);
	}
	return appService;
}

function CloseAppService() {
	//appService.shutdown();
	appService = null;
}


export default { GetAppServiceInstance, CloseAppService }
