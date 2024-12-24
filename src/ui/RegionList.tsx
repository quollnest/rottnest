import React from 'react';
import styles from './styles/RegionList.module.css';

/**
 * RegionListData, will contain
 * a list of regions that 
 *
 */
type RegionListData = {
	regions: Array<any>
	
}


type RegionItemData = {
	region: any
	selected: boolean
}

/**
 * Maintains state data fro the region list 
 * 
 */
type RegionListState = {
	selectedIndex: number
}

/**
 * Information around how it is rendered
 * is carried over via data
 *
 */
class RegionItemRender extends React.Component<RegionItemRender, {}> {


	render() {
		return (
			<>
			</>
		);
	}
}


/**
 * Contains a list of regions
 * and references to existing regions that
 * provide a quick reference
 *
 */
class RegionList extends React.Component<RegionListData, RegionListState> {
	
	state: RegionListState = {

		selectedIndex: -1
	}

	setSelected(idx: number) {
		this.setState({selectedIndex: idx})
	}

	render() {

		const regions = this.props.regions;
		const renderRegions = regions.map(
			r => <RegionItemRender {...r} />)

		return (

			<div className={styles.regionList}>
				{renderRegions}
			</div>
		)
	}

}

export default RegionList;
