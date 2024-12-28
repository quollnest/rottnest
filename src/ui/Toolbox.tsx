import React from 'react';
import { Tool } from './tools/Tool.ts';
import { ToolItem } from './tools/ToolItem.tsx';
import styles from './styles/Toolbox.module.css';
import {RegisterToolOperations} from './tools/RegisterToolItem.ts';
import {BufferToolOperations} from './tools/BufferRegionToolItem.ts';
import {BusToolOperations} from './tools/BusRegionToolItem.ts';
import {TFactoryToolOperations} from './tools/FactoryRegionToolItem.ts';
import {BellStateToolOperations} from './tools/BellStateToolItem.ts';
import {SelectorToolOperations} from './tools/SelectorToolItem.ts';
import RottnestContainer from './container/RottnestContainer.tsx';


/**
 * ToolboxProps is designed to
 * set some defaults as well as any events
 * that require the container to have a trigger for
 *
 */
type ToolboxProps = {
	toolbox: { headerName: string }
	container: RottnestContainer
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
	container: RottnestContainer
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
		container: this.props.container
	}

	tools: Array<Tool> = [
		{
			kind : 0,
			kindName: 'Selector',
			imageUrl: 'selector_img.svg',
			events: SelectorToolOperations,
			description: "Use the selector"
		},
				{
			kind : 1,
			kindName: 'Buffer',
			imageUrl: 'buffer_img.svg',
			events: BufferToolOperations,
			description: "Mark buffers in your design"
		},
		{
			kind : 2,
			kindName: 'Bus',
			imageUrl: 'bus_img.svg',
			events: BusToolOperations,
			description: "Mark busses in your design"
		},
		{
			kind : 3,
			kindName: 'T-Factory',
			imageUrl: 'tfactory_img.svg',
			events: TFactoryToolOperations,
			description: "Mark t-factories in your design"
		},
		{
			kind : 4,
			kindName: 'Bell State',
			imageUrl: 'bellstate_img.svg',
			events: BellStateToolOperations,
			description: "Mark bellstates in your design"
		},
		{
			kind : 5,
			kindName: 'Register',
			imageUrl: 'register_img.svg',
			events: RegisterToolOperations,
			description: "Mark registers in your design"

		},

	]

	
	updateSelected(idx: number) {
		//TODO: Still need to set the current events for
		//the design space
		this.state.container.data.selectedIndex = idx;
		this.setState({
			selectedToolIndex: idx,
			container: this.state.container
		});
	}

	render() {
		
		const parent = this;
		const headerName = this.props.toolbox.headerName;
		const toolItems = this.tools.map(
			(tool: Tool, idx: number) => <ToolItem tool={tool} 
				isSelected={this.state.selectedToolIndex === idx} 
				toolParent={parent}
				/>);

		return (
			<div className={styles.toolbox}>
				<header className={styles.toolboxHeader}>
					{headerName}</header>
				{toolItems}
			</div>
		)
	}

}

export default Toolbox;
