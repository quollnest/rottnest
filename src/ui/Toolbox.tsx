import React from 'react';
import Tool from './tools/Tool.ts';
import { ToolItem } from './tools/ToolItem.ts';
import styles from './styles/Toolbox.module.css';


/**
 * ToolboxProps is designed to
 * set some defaults as well as any events
 * that require the container to have a trigger for
 *
 */
type ToolboxProps = {
	headerName: string
}


/**
 * ToolboxState are fields that
 * require updating and also triggering
 * a re-render of the toolbox when
 * an event occurs
 *
 */
type ToolboxState = {
	selectedToolIndex: number
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
class Toolbox extends React.Component<ToolboxProps, ToolboxState> {
	
	state: ToolboxState = {
		selectedToolIndex: 0,
	}

	tools: Array<Tool> = [

	]

	render() {
		const toolItems = this.tools.map(
			t => <ToolItem {...t} />);
		return (
			<div className={styles.toolbox}>
				{toolItems}
			</div>
		)
	}

}

export default Toolbox;
