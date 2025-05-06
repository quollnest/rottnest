import React from 'react';
import { Tool } from './tools/Tool.ts';
import { ToolItem } from './tools/ToolItem.tsx';
import styles from './styles/Toolbox.module.css';
import {RegisterToolOperations} from './tools/RegisterToolItem.ts';
import {BufferToolOperations} from './tools/BufferRegionToolItem.ts';
import {BusToolOperations} from './tools/BusRegionToolItem.ts';
import {FactoryToolOperations} from './tools/FactoryRegionToolItem.ts';
import {BellStateToolOperations} from './tools/BellStateToolItem.ts';
import {SelectorToolOperations} from './tools/SelectorToolItem.ts';
import {UnselectToolOperations} from './tools/UnselectToolItem.ts';
import {PanToolOperations} from './tools/PanTool.ts';
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
	'data-component'?: string,
	'data-help-id'?: string,
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
			description: "Use the selector",
			helpId: "selector_tool"
		},
		{
			kind : 1,
			kindName: 'Buffer',
			imageUrl: 'buffer_img.svg',
			events: BufferToolOperations,
			description: "Mark buffers in your design",
			helpId: "buffer_tool"
		},
		{
			kind : 2,
			kindName: 'Bus',
			imageUrl: 'bus_img.svg',
			events: BusToolOperations,
			description: "Mark busses in your design",
			helpId: "bus_tool",
		},
		{
			kind : 3,
			kindName: 'Factory',
			imageUrl: 'factory_img.svg',
			events: FactoryToolOperations,
			description: "Mark factories in your design",
			helpId: "factory_tool",
		},
		{
			kind : 4,
			kindName: 'Bell State',
			imageUrl: 'bellstate_img.svg',
			events: BellStateToolOperations,
			description: "Mark bellstates in your design",
			helpId: "bellstate_tool",
		},
		{
			kind : 5,
			kindName: 'Register',
			imageUrl: 'register_img.svg',
			events: RegisterToolOperations,
			description: "Mark registers in your design",
			helpId: "register_tool",

		},
		{
			kind : 6,
			kindName: 'Unselect',
			imageUrl: 'unselector_img.svg',
			events: UnselectToolOperations,
			description: "Use the unselect tool",
			helpId: "unselect_tool",
		},
		{
			kind : 7,
			kindName: 'Pan',
			imageUrl: 'pantool_img.svg',
			events: PanToolOperations,
			description: "Use the pan tool",
			helpId: "pan_tool",
		},
	]

	
	updateSelected(idx: number) {
		//TODO: Still need to set the current events for
		//the design space
		this.state.container.
			state.appStateData
			.componentData
			.selectedTool = idx;
		
		const { subTypes } = this.state.container
			.getSubTypesAndSelected()
		//TODO: Make a setter in the container, this
		//is gross
		this.state.container
			.state.appStateData
			.componentData
			.selectedSubTool = subTypes.length === 0 ?
				0 :
				subTypes.length-1;

		this.setState({
			selectedToolIndex: idx,
			container: this.state.container
		});
		this.state.container.triggerUpdate();
	}

	render() {	
		const parent = this;
		const headerName = this.props.toolbox.headerName;
		const toolItems = this.tools.map(
			(tool: Tool, idx: number) => <ToolItem 
			tool={tool} key={idx} 
				isSelected={this.state
					.selectedToolIndex === idx} 
				toolParent={parent} />);
		
		const { 'data-component': dataComponent, 'data-help-id': dataHelpId } = this.props;
		
		return (
			<div 
				className={styles.toolbox}
				data-component={dataComponent || "toolbox_panel"}
				data-help-id={dataHelpId || "toolbox_panel"}
			>
				<header 
					className={styles.toolboxHeader}
					data-component="toolbox_header" 
					data-help-id="toolbox_header"
				>
					{headerName}
				</header>
				<div 
					data-component="toolbox_items"
					data-help-id="toolbox_items"
					className={styles.toolboxItems || ""}
				>
					{toolItems}
				</div>
			</div>
		)
	}

}

export default Toolbox;
