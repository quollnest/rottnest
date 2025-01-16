import React from 'react';
import styles from './styles/RegionList.module.css';
import {RegionDataList} from '../model/Project';
import {RegionData } from '../model/RegionData';
import RottnestContainer from './container/RottnestContainer';

import {
	EyeOutlined,
	EyeInvisibleOutlined
} from '@ant-design/icons'

type RegionListProps = {
	regions: RegionDataList
	container: RottnestContainer
}

type RegionItemData = {
	tag: string
	kind: string
	idx: number
	rdata: RegionData
	isVisible: boolean
	isSelected: boolean
	setVisibility:() => void
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

		const isVisible = data.isVisible;


		const onSelect = (_: React.MouseEvent<HTMLLIElement>) => {
			const pluKind = RegionData.PluraliseKind(kind);
			rottContainer.selectCurrentRegion(pluKind, idx);
		}

		const visToggle = data.setVisibility;

		const isSelectedStyle = isSelected ? styles.regionSelected : '';

		return (
			<li key={name} className={`${styles.regionItem}
				${isSelectedStyle}`}
				onClick={onSelect}>
				<span>{name}</span>
				<span className={styles.regionItemBtn}
					onClick={visToggle}>
				{isVisible ? <EyeOutlined className={styles.regionItemBtn} /> : 
					<EyeInvisibleOutlined className={styles.regionItemBtn} />}
				</span>
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
		const updateVisibility = (regionData: RegionData) => {
			container.updateVisibility(regionData,
				!regionData.isVisible());
		}
		
		const renderRegions = regions.flattenWithTags()
			.filter((r, _) => !r.rdata.isDead())
			.map(
				(r, idx) => {
				//TODO: Remove ternery
				let selKindS = selKind !== null 
					? selKind : '';
				if(selKind) {
					selKindS = RegionData.SingularKind(selKind);
				}
				return (<RegionItemRender 
				tag={r.tag}
				kind={r.kind}
				idx={r.idx}
				rdata={r.rdata} 
				isVisible={r.rdata.isVisible()}
				setVisibility={() => updateVisibility(r.rdata)}
				container={container}
				isSelected={r.kind === selKindS 
					&& r.idx == selIdx}
				key={idx} 
				/>)
			});

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
