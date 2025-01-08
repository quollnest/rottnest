import React from 'react';
import styles from './styles/RegionList.module.css';
import {RegionData, RegionDataList} from '../model/Project';

type RegionListProps = {
	regions: RegionDataList
}

type RegionItemData = {
	tag: string 
	rdata: RegionData
}

/**
 * Maintains state data fro the region list  
 */
type RegionListState = {
	selectedIndex: number
}

/**
 * Information around how it is rendered
 * is carried over via data
 */
class RegionItemRender extends React.Component<RegionItemData, {}> {


	render() {
		const data = this.props;
		return (
			<li key={data.tag} className={styles.regionItem}>
				{data.tag}
			</li>
		);
	}
}


/**
 * Contains a list of regions
 * and references to existing regions that
 * provide a quick reference
 *
 */
class RegionList extends React.Component<RegionListProps, 
	RegionListState> {
	
	state: RegionListState = {

		selectedIndex: -1
	}

	setSelected(idx: number) {
		this.setState({selectedIndex: idx})
	}

	render() {
		const headerName = 'Regions';
		const regions = this.props.regions;
		const renderRegions = regions.flattenWithTags().map(
			(r, idx) => <RegionItemRender {...r} key={idx} 
				/>)

		return (

			<div className={styles.regionList}>
				<header className={styles
					.regionListHeader}>
					{headerName}</header>
				<ul className={styles.
					regionListing}>
				{renderRegions}
				</ul>
			</div>
		)
	}

}

export default RegionList;
