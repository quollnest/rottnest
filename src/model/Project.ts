


/**
 * Project Details,
 * contains simple information about the project/architecture
 * This will be used by the settings form/project setup
 *
 */
export type ProjectDetails = {
	projectName: string
	author: string
	width: number
	height: number
	description: string	
}

class RegionData {

}


class RottnestProject {
	name: string = "";
	regions: Array<RegionData> = [];
}


export default RottnestProject;
