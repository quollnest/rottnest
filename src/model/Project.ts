import { RegionDataList, FlatRegions } from './RegionDataList.ts'
import { RegionData } from './RegionData.ts'


/**
 * Project Details,
 * contains simple information about the project/architecture
 * This will be used by the settings form/project setup
 */
export type ProjectDetails = {
	projectName: string
	author: string
	width: number
	height: number
	description: string	
}

/**
 * Aggregate between project details
 * and region list
 */
export type ProjectAssembly = {
	projectDetails: ProjectDetails
	regionList: RegionDataList
}

/**
 * Tags the region with a string (likely kind)
 * and associates it with a RegionData object
 */
export type TaggedRegionData = {
	tag: string
	regionData: RegionData
}

/**
 * Project details with flat regions,
 * currently used for saving to file
 */
export type ProjectDump = {
	project: ProjectDetails
	regions: FlatRegions
}

