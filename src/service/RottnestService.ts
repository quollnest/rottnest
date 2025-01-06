import { ProjectDetails, RottnestProject }from "../model/Project";

/**
 * Saves the current project object and writes it
 * to localstorage
 *
 */
const SaveToLocalStorage = (key: string, project: ProjectDetails) => {
	let strRes = JSON.stringify(project);
	localStorage.setItem(key, strRes);
}


/**
 * Loads data from localstorage
 */
const LoadFromLocalStorage = (key: string): ProjectDetails 
	| null => {
	
	let res = localStorage.getItem(key);
	if(res != null) {
		return JSON.parse(res);
	}
	return null;
}



/**
 * Saves settings that the user has made and
 * writes it to local storage
 
const SaveSettingsToLocalStorage = (project: RottnestSettings) => {

}

 
const LoadSettingsFromLocalStorage = (key: string): 
	RottnestSettings | null => {

	return null;
}
*/
export default { 
	SaveToLocalStorage,
	LoadFromLocalStorage,
};
