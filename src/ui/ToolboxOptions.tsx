import React from 'react';
import styles from './styles/ToolboxOptions.module.css';
import RottnestContainer from './container/RottnestContainer';




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
	selectedToolIndex: number
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
	
	state: ToolboxOptionsState = {
		selectedToolIndex: 0,
		paintMode: false,

	}

	render() {
	
		const headerName = 'Options';

		const container = this.props.container;
		const toolIndex = container.getToolIndex();
		
		const updateFn = (updat: boolean) => {

			const nstate = {...this.state};
			nstate.paintMode = updat;
			this.setState(nstate);
		}

		const optionRender = toolIndex >= 1 && toolIndex <= 5 ?
			<PaintModeTool paintMode={this.state.paintMode} 
				pmodeUpdate={updateFn} /> : <></> 


		return (
			<div className={styles.toolboxOptions}>
				<header className={styles.toolboxOptionsHeader}>
					{headerName}</header>
				{optionRender}
			</div>
		)
	}

}

export default ToolboxOptions;
