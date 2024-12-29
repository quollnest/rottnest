
import RottnestContainer from "../container/RottnestContainer"

import { ProjectDump } from '../../model/Project';

/**
 * This triggers a save of the project, which will:
 * 	* ProjectDetails
 * 	* RegionDataList
 */
const leftClick = (rott: RottnestContainer) => {
	
	let details = rott.getProjectDetails();
	let regionList = rott.getRegionList();

	const project: ProjectDump = {
		project: details,
		regions: regionList
	};

	const blob = new Blob([JSON.stringify(project)], 
			      { type: 'application/json' });
	let uobj = URL.createObjectURL(blob);
	
	let adown = document.createElement("a");
	adown.href = uobj;
	adown.download = 'project.json';
	adown.click();
	
}


const auxEvent = (_: RottnestContainer) => { }



export default { leftClick, auxEvent }
