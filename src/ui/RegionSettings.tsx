import React from "react";
import styles from './styles/ErrorList.module.css';





class RegionSubType extends React.Component<{}, {}> {

	render() {	
		return (
			<></>
		)
	}
}

/**
 * RegionSettings, when a region is selected from the
 * RegionList, it will provide a set of region information
 * that can be changed for that region
 *
 */
class RegionSettings extends React.Component<{}, {}> {
	
	/**
	 * 
	 */
	render() {
		const headerName = 'Region Settings';
		

		return (
			<div className={styles.regionSettings}>
				<header>{headerName}</header>
			</div>
		)
	}

}

export default RegionSettings;
