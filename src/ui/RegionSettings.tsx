import React from "react";
import styles from './styles/RegionSettings.module.css';
import RottnestContainer from "./container/RottnestContainer";
import {RegionData} from "../model/RegionData";
import {SubKind} from "../model/RegionKindMap";


type RegionConnection = {
	name: string
	listIdx: number
	connectorId: number
	direction: number
}

type RegionConnectionList = {
	connections: Array<RegionConnection>
	connectedIdx: number
	connectedKind: string | null
}

type RegionConnectorData = {
	connectionList: RegionConnectionList
	container: RegionSettings
}

class RegionConnectorOptions extends React.Component
	<RegionConnectorData, {}> {
	
	static MatchInConnections(
		connections: Array<RegionConnection>,
		idx: number, kind: string): number {
		for(let i = 0; i < connections.length; i++) {
			const c = connections[i];
			if(c.name===kind && c.listIdx===idx) {
				return i;
			}
		}
		return -1;
	}

	render() {
		
		const props = this.props;
		const settings = props.container;
		const connections = props.connectionList
			.connections;
		const connectedIdx = props.connectionList
			.connectedIdx;
		const connectedKind = props.connectionList
			.connectedKind;
			
		const selectedIdx = RegionConnectorOptions
			.MatchInConnections(connections, 
					    connectedIdx,
					   connectedKind
					   === null ? '' :
					   connectedKind);
		const dirStrs = RegionData
			.GetDirectionStrings();
		const renderedOptions = 
			connections.length === 0 ?
			<option value={"Not Selected"}>
			Not Selected
			</option> :
			connections.map((rc, idx) => {
			return (
				<option value={idx} 
				key={idx}>
				{`${rc.name},${dirStrs[
					rc.direction]}`}
				</option>
			);
		});
		
		const regionSelect = (e: 
			React
			.ChangeEvent<HTMLSelectElement>)=> {
			if(e.target.value!=='Not Selected') {

				//TODO: Below are two bugs
				const conIdx = Number(e
						.target.value);
				const regTup = 
					connections[conIdx];
				if(regTup) {
					const conDir = regTup
						.listIdx
					const kindKey = regTup
						.name;
					const dirIndex = regTup
						.direction;

				
					console.log(dirIndex);
					const kindPlu = 
						RegionData
						.PluraliseKind(
						kindKey);
					settings
					.updateDirOfSelected(
						conDir, 
						kindPlu,
						dirIndex);
				}
			}
		}

		return (
			<div className={styles
				.connectionsComp}>
			<label>Connections</label>
			<select name="connections" 
			value={selectedIdx} onChange={
				regionSelect}>
				{renderedOptions}
			</select>
			</div>
		)	
	}

}

type RegionRouterData = {
	container: RegionSettings
	routerList: Array<[number, string]>
	currentlySelected: number
}

class RegionRouterList extends 
	React.Component<RegionRouterData, {}> {

	checkIfNullAndUpdate(settings: RegionSettings,
			    kind: string) {
		settings.updateRouterOfSelectedChkNull(kind);
	}

	render() {
		const props = this.props;
		const settings = props.container;
		const routerList = props.routerList;
		const selectedRouter = props
			.currentlySelected;
		 
		const renderedOptions = routerList
			.length === 0 ? 
			<option value={"Not Selected"}>
			Not Selected</option> :
			routerList.map((rc, _) => {
			const [ rIdx, rName ] = rc;

			return (
				<option value={rIdx} 
				key={rIdx}>
				{rName}
				</option>
			)
		});
		if(routerList.length > 0) {
			const name = routerList[0][1];
		
			this.checkIfNullAndUpdate(settings,
					 name);
		}
		const regionSelect = (e: 
			React
			.ChangeEvent<HTMLSelectElement>)=> {
			if(e.target.value !== 'Not Selected') {
				settings
				.updateRouterOfSelected(
					e.target.value);
			}
		}

		return ( 
			<div className={styles.subTypeComp}>
			<label>Router Type</label>
			<select name="connections" 
			onChange={regionSelect} 
			value={selectedRouter}>
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

/**
 * List of subtypes of a region that
 * impact the configuration and how it is to be compiled
 */
class RegionSubTypeList extends React.Component
	<RegionSubTypeComponentData, {}> {
	
	subKindKeyToIdx(subList: Array<SubKind>, kind: string)
		: number {

		let m = -1;
		if(subList) {	
			for(let i= 0; i < subList.length;i++){
				if(subList[i].name === kind){
					m = i;
					break;
				}
			}
		}
		return m;
	}

	render() {
		const props = this.props;
		const settings = props.container;
		const subtypes = props.dataList.subtypes;
		const selectedSubKind = props.selectedSubKind 
			!== null ? 
			props.selectedSubKind : '';
	

		const renderedOptions = subtypes.length 
			=== 0 ? 
			<option value={"Not Selected"}>
			Not Selected</option> :
			subtypes.map((rc, idx) => {

			return (
				<option value={rc.name} 
				key={idx}>
				{rc.name}
				</option>
			)
		});

		const regionSelect = (e: 
			React
			.ChangeEvent<HTMLSelectElement>)=> {
			if(e.target.value !== 'Not Selected') {
				settings
				.updateSubTypeOfSelected(
					e.target.value);
			}
		}
		return ( 
			<div className={styles.subTypeComp}>
			<label>Region Type</label>
			<select name="connections" 
			onChange={regionSelect} 
			value={selectedSubKind}>
				{renderedOptions}
			</select>
			</div>
		)	
	}
}

//TODO: Dead code, will need to re-evaluate where it goes next
/*
type RegionFactoryKindData = {
	container: RottnestContainer
	defaultValue: number
}

type RegionFactoryKindState = {
	bstateValue: number 
}*/

/**
 * RegionSettings, when a region is selected from the
 * RegionList, it will provide a set of region information
 * that can be changed for that region
 *
 */
/*class RegionBellStateSettings 
	extends React.Component<RegionFactoryKindData,
	RegionFactoryKindState> {

	state = {

		bstateValue: 1
	};

	changeBStateValue(v: number) {
		
	}

	render() {

		const rbss = this;

		return ( 
			<div className={styles.subTypeComp}>
			<label>Bell State Counter</label>
				<input type="text" 
				onChange={(e) => {
					const vStr = e
						.target.value;
					const vNum = 
						Number(vStr);
					rbss
					.changeBStateValue(
						vNum);
				}}></input>
			</div>
		)	}

}*/



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
class RegionSettings extends React
	.Component<RegionSettingsData, {}> {

	rottContainer: RottnestContainer = this.props
		.container;
	
	updateRouterOfSelectedChkNull(subTypeKey: string) {
		const currentObj = this.rottContainer
			.getSelectedRegionData();
		if(currentObj !== null && currentObj !== undefined 
		   && currentObj.routerKind === null) {
			
			
			let regData: RegionData = currentObj
				.shallowDuplicate();
			regData.setRouterKind(subTypeKey);
		
			this.rottContainer
			.updateSelectedRegionDataNoUpdate(regData);
		}

	}

	updateRouterOfSelected(subTypeKey: string) {

		const currentObj = this.rottContainer
			.getSelectedRegionData();
		if(currentObj !== null 
		   && currentObj !== undefined) {
			
			console.log(currentObj);
			
			let regData: RegionData = currentObj
				.shallowDuplicate();
			console.log(subTypeKey);
			regData.setRouterKind(subTypeKey);
		
			this.rottContainer
			.updateSelectedRegionData(regData);
		}
		
	}

	updateSubTypeOfSelected(subTypeKey: string) {
		const currentObj = this.rottContainer
			.getSelectedRegionData();

		if(currentObj) {
			let regData: RegionData = currentObj
				.shallowDuplicate();
			regData.subTypeKind = subTypeKey;
		
			this.rottContainer
			.updateSelectedRegionData(regData);
		}
		
	}


	updateDirOfSelected(conDirIdx: number, 
			    conKind: string, 
			    dir: number) {
		const currentObj = this.rottContainer
			.getSelectedRegionData();
		const regList = this.rottContainer
			.getRegionList();
		if(currentObj) {
			let regData: RegionData = currentObj
				.shallowDuplicate();

			let regKind = regData.getKind();

			if(regData.getSubKind() !== conKind) {
				const encKind = regList
					.getConnectKindIndex(
					regKind, conKind);

				regData
				.setConnectionInformation(
					conKind, 
					conDirIdx, 
					dir);

				regData
				.updateManuallySet(true);
				regData
				.setDirectionOnCells(dir,
						encKind);
				this.rottContainer
				.updateSelectedRegionData(
					regData);
			}
		}
	}

	

	/**
	 * 
	 */
	render() {
		const headerName = 'Region Settings';
		const parentContainer = this;
		const selectedRegion = this.rottContainer
			.getSelectedRegionData();
		const subList = this.props.subTypes;
		const connectionsList = this.props.connections;
		const routerMap = this.props.container
			.getRouterList();
		let routerList: Array<[number, string]> = [];
		if(selectedRegion) {
			let kstr = 
				RegionData.SingularKind(
				selectedRegion.getSubKind())
				.toLowerCase();

			const rtrs = routerMap.get(kstr);
			if(rtrs) {
				routerList = 
					rtrs.options
					.map((rv, idx) => {
						return [idx, 
							rv];
					});
			}
		}

		let currentSubKey = ''; 
		if(selectedRegion !== null && 
		   selectedRegion !== undefined) {
			currentSubKey = selectedRegion
				.subTypeKind === null ?
				'' : selectedRegion
				.subTypeKind;
		}

		const isVisible = selectedRegion 
			!== null;
		const currentRouter = this.props.container
			.getSelectedRouterIndex();
		

		return (
			<div className={styles.regionSettings}
				style={{visibility: isVisible 
				? 'visible' : 'hidden'}}>
				<header className={styles
					.regionSettingsHeader}>
					{headerName}
				</header>
				<RegionConnectorOptions
					connectionList={
					connectionsList}
					container={
					parentContainer} />
				<RegionSubTypeList 
					dataList={subList}
					container={
					parentContainer}
					selectedSubKind={
					currentSubKey}
				/>
				<RegionRouterList 
					container={
					parentContainer}
					currentlySelected={
						currentRouter}
					routerList={
						routerList
					}

				/>
			</div>
		)
	}

}

export default RegionSettings;
