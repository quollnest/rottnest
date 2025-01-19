import React from 'react';
import styles from './styles/ToolboxOptions.module.css';
import RottnestContainer from './container/RottnestContainer';
import {SubKind} from '../model/RegionKindMap';




/**
 * ToolboxProps is designed to
 * set some defaults as well as any events
 * that require the container to have a trigger for
 *
 */
type ToolboxOptionsProps = {
	container: RottnestContainer
	headerName: string
}


/**
 * ToolboxState are fields that
 * require updating and also triggering
 * a re-render of the toolbox when
 * an event occurs
 *
 */
type ToolboxOptionsState = {
	paintMode: boolean
}

/**
 * 
 */
type PaintModeProps = {
	paintMode: boolean
	pmodeUpdate: (updat: boolean) => void
}

class PaintModeTool extends React.Component<PaintModeProps, {}> {
	render() {

		const pmode = this.props.paintMode;
		const upfn = this.props.pmodeUpdate;

		return (
			<div className={styles.toolSegment}>
			<input className={styles.paintMode}
				name="paintmode" type="checkbox" 
				checked={pmode} 
				onChange={() => upfn(!pmode)} />
			<label>Enable Paint Mode (Experimental)
			</label>
			</div>
		)
	}
}

/**
 * 
 */
type ToolSubTypeDataList = {
	subTypes: Array<SubKind>
	currentlySelected: number
}

/**
 * 
 */
type ToolSubTypeComponentData = {
	dataList: ToolSubTypeDataList
	container: ToolboxOptions
}

/**
 * List of subtypes of a region that
 * impact the configuration and how it is to be compiled
 */
class ToolSubTypeList extends React.Component
	<ToolSubTypeComponentData, {}> {
	
	subKindKeyToIdx(subList: Array<SubKind>, kind: number): 
		string {
		let m: string = 'Not Selected';
		if(subList) {	
			for(let i = 0; i < subList.length; i++) {
				if(i === kind) {
					m = subList[i].name;
					break;
				}
			}
		}
		return m;
	}

	render() {
		const props = this.props;
		const settings = props.container;

		const toolSubKind = this.props.dataList
			.currentlySelected;

		const subtypes = props.dataList
			.subTypes;

		const getSelectedKind = this
			.subKindKeyToIdx(subtypes, toolSubKind);
		
		const renderedOptions = subtypes.length === 0 ? 
			<option value={"Not Selected"}>
			Not Selected</option> :
			subtypes.map((rc, idx) => {
			return (
				<option value={rc.name} 
				key={idx}>{rc.name}</option>
			)
		});

		const regionSelect = (e: 
			React.ChangeEvent<HTMLSelectElement>)=> {
			if(e.target.value !== 'Not Selected') {
				settings
				.updateSubType(
					Number(e
					       .currentTarget
					       .selectedIndex)
				);
			}
		}

		return ( 
			<div className={styles.toolOption}>
			<label>Region Type</label>
			<select name="toolSubKinds" 
			onChange={regionSelect} 
			value={getSelectedKind}>
				{renderedOptions}
			</select>
			</div>
		)	
	}
}



/**
 * Designed to hold the current set of
 * tools and monitor the current event
 * states
 *
 * Responsible for also updating its parent
 * container of any side effect changes
 * that a new selection may trigger
 */
class ToolboxOptions extends React.Component<ToolboxOptionsProps, 
	ToolboxOptionsState> {

	rottContainer: RottnestContainer = this.props.container;
	state: ToolboxOptionsState = {
		paintMode: false,
	}
	
	getSubToolIndex(): number {
		return this
			.rottContainer.getToolIndex();
	}

	updateSubType(subTypeIndex: number) {
		this.rottContainer
		.updateSelectedSubType(subTypeIndex);;
	}

	render() {
	
		const headerName = 'Tool Options';
		const optionsContainer = this;
		const container = this.props.container;
		const toolIndex = container.getToolIndex();

		const { subTypes, 
			selectedSubTypeTool } 
			= container.getSubTypesAndSelected();

		const updatePaintFn = (updat: boolean) => {

			const nstate = {...this.state};
			nstate.paintMode = updat;
			this.setState(nstate);
		}


		const optionRender = toolIndex >= 1 && toolIndex <= 5 ?
			<>
			<PaintModeTool paintMode={this.state.paintMode} 
				pmodeUpdate={updatePaintFn} />
			<ToolSubTypeList 
				dataList={ 
					{ 
						subTypes: subTypes,
						currentlySelected:
						selectedSubTypeTool
					}
				}
				container={optionsContainer}
			/> 
			</>
			: <></> 


		return (
			<div className={styles.toolboxOptions}>
				<header className={styles
					.toolboxOptionsHeader}>
					{headerName}</header>
				{optionRender}
			</div>
		)
	}

}

export default ToolboxOptions;
