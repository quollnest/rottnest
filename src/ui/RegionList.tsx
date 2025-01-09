import React from 'react';
import styles from './styles/RegionList.module.css';
import {RegionDataList, RottnestProject} from '../model/Project';
import {RegionData } from '../model/RegionData';
import RottnestContainer from './container/RottnestContainer';

type RegionListProps = {
	regions: RegionDataList
	container: RottnestContainer
}

type RegionItemData = {
	tag: string
	kind: string
	idx: number
	rdata: RegionData
	isSelected: boolean
	container: RottnestContainer
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
		const rottContainer = data.container;
		
		const name= data.tag;
		const idx = data.idx;
		const kind = data.kind;
		const isSelected = this.props.isSelected;


		const onSelect = (_: React.MouseEvent<HTMLLIElement>) => {
			console.log("Attempting to select");
			rottContainer.selectCurrentRegion(kind, idx);
		}

		const isSelectedStyle = isSelected ? styles.regionSelected : '';

		return (
			<li key={name} className={`${styles.regionItem}
				${isSelectedStyle}`}
				onClick={onSelect}>
				{name}
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
		const container = this.props.container;
		const [selIdx, selKind] = container.getRegionSelectionData();

		const renderRegions = regions.flattenWithTags().map(
			(r, idx) => <RegionItemRender 
				tag={r.tag}
				kind={r.kind}
				idx={r.idx}
				rdata={r.rdata} 
				container={container}
				isSelected={r.kind === selKind 
					&& r.idx == selIdx}
				key={idx} 
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
