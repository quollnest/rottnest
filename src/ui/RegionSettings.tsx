import React from "react";
import styles from './styles/RegionSettings.module.css';
import RottnestContainer from "./container/RottnestContainer";
import {RegionData} from "../model/RegionData";
import {SubKind} from "../model/KindMap";



type RegionConnection = {
	name: string
	connectorId: number 
}

type RegionConnectionList = {
	connections: Array<RegionConnection>
	selectedIdx: number
}

type RegionConnectorData = {
	connectionList: RegionConnectionList
	container: RegionSettings
}

class RegionConnectorOptions extends React.Component<RegionConnectorData, {}> {
	


	render() {
		const props = this.props;
		const settings = props.container;
		const connections = props.connectionList.connections;
		const selectedIdx = props.connectionList.selectedIdx;

		const renderedOptions = connections.length === 0 ?
			<option value={"Not Selected"}>Not Selected</option> :
			connections.map((rc, idx) => {
			return <option value={rc.name} key={idx}>{rc.name}</option>
		});

		const regionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
			if(e.target.value !== 'Not Selected') {
				const conDir = Number(e.target.value);
				const kindKey = e.target.innerText;
				settings.updateDirOfSelected(conDir, kindKey);
			}
		}

		return (
			<div className={styles.connectionsComp}>
			<label>Connections</label>
			<select name="connections" value={selectedIdx} onChange={regionSelect}>	
				{renderedOptions}
			</select>
			</div>
		)	
	}

}




type RegionSubTypeDataList = {
	subtypes: Array<SubKind>
	currentlySelected: number
}

type RegionSubTypeComponentData = {
	dataList: RegionSubTypeDataList
	container: RegionSettings
	selectedSubKind: string
}

type RegionSubState = {
	
}

/**
 * List of subtypes of a region that
 * impact the configuration and how it is to be compiled
 */
class RegionSubTypeList extends React.Component<RegionSubTypeComponentData, RegionSubState> {
	
	subKindKeyToIdx(subList: Array<SubKind>, kind: string): number {
		let m = -1;
		for(let i = 0; i < subList.length; i++) {
			if(subList[i].name === kind) {
				m = i;
				break;
			}
		}
		return m;
	}

	render() {
		const props = this.props;
		const settings = props.container;
		const subtypes = props.dataList.subtypes;
		const selectedSubKind = props.selectedSubKind !== null ? 
			props.selectedSubKind : '';
		const selectedIdx = this.subKindKeyToIdx(subtypes, selectedSubKind);
		console.log(subtypes, selectedIdx, selectedSubKind);	
	

		const renderedOptions = subtypes.length === 0 ? 
			<option value={"Not Selected"}>Not Selected</option> :
			subtypes.map((rc, idx) => {
			return <option value={rc.name} key={idx} >{rc.name}</option>
		});

		const regionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
			console.log(e.target.value);
			if(e.target.value !== 'Not Selected') {
				settings.updateSubTypeOfSelected(e.target.value);
			}
		}
		return ( 
			<div className={styles.subTypeComp}>
			<label>Region Type</label>
			<select name="connections" onChange={regionSelect} value={selectedSubKind}>
				{renderedOptions}
			</select>
			</div>
		)	
	}
}

type RegionSettingsData = {
	subTypes: RegionSubTypeDataList
	connections: RegionConnectionList
	container: RottnestContainer
}

/**
 * RegionSettings, when a region is selected from the
 * RegionList, it will provide a set of region information
 * that can be changed for that region
 *
 */
class RegionSettings extends React.Component<RegionSettingsData, {}> {

	rottContainer: RottnestContainer = this.props.container;

	updateSubTypeOfSelected(subTypeKey: string) {
		const currentObj = this.rottContainer.getSelectedRegionData();
		if(currentObj) {
			let regData: RegionData = currentObj.shallowDuplicate();
			regData.subTypeKind = subTypeKey;
		
			this.rottContainer.updateSelectedRegionData(regData);
		}
		
	}


	updateDirOfSelected(conDirIdx: number, conKind: string) {
		const currentObj = this.rottContainer.getSelectedRegionData();
		if(currentObj) {
			let regData: RegionData = currentObj.shallowDuplicate();
			regData.setConnectionInformation(conKind, conDirIdx);
		
			this.rottContainer.updateSelectedRegionData(regData);
		}
	}

	

	/**
	 * 
	 */
	render() {
		const headerName = 'Region Settings';
		const parentContainer = this;
		const selectedRegion = this.rottContainer.getSelectedRegionData();
		const subList = this.props.subTypes;
		const connectionsList = this.props.connections;
		const currentSubKey = selectedRegion?.subTypeKind; //TODO: Make method call
		return (
			<div className={styles.regionSettings}>
				<header className={styles.regionSettingsHeader}>
					{headerName}
				</header>
				<RegionConnectorOptions
					connectionList={connectionsList}
					container={parentContainer} />
				<RegionSubTypeList 
					dataList={subList}
					container={parentContainer}
					selectedSubKind={currentSubKey}
					/>
			</div>
		)
	}

}

export default RegionSettings;
