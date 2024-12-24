import RottnestContainer from "../container/RottnestContainer";
import RottnestProject from "../model/Project";
import RottnestSettings from "../model/Settings";

/**
 * Saves the current project object and writes it
 * to localstorage
 *
 */
const SaveToLocalStorage = (key: string, project: RottnestProject) => {
	let strRes = JSON.stringify(project);
	localStorage.setItem(key, strRes);
}


/**
 * Loads data from localstorage
 */
const LoadFromLocalStorage = (key: string): RottnestProject | null => {
	let res = localStorage.getItem(key);
	if(res != null) {
		return JSON.parse(res);
	}
	return null;
}



/**
 * Saves settings that the user has made and
 * writes it to local storage
 */
const SaveSettingsToLocalStorage = (project: RottnestSettings) => {

}

/**
 *
 */
const LoadSettingsFromLocalStorage = (key: string): 
	RottnestSettings | null => {

	return null;
}

export default { 
	SaveToLocalStorage,
	LoadFromLocalStorage,
	SaveSettingsToLocalStorage,
	LoadSettingsFromLocalStorage
};
