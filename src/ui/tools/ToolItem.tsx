import React from "react";
import { ToolData } from './Tool';

import styles from '../styles/ToolItem.module.css';
import {CloseSquareFilled, CloseSquareOutlined, 
	SelectOutlined} from "@ant-design/icons";

/**
 * ToolItemProps,
 * properties of the selected tool, as given by
 * the container
 *
 */
/*type ToolItemProps = {
	isSelected: boolean
}*/

/**
 * ToolItemState,
 * update properties of the tool
 * when it is selected
 *
 * At the moment, nothing has been given
 */
//type ToolItemState = {}

const ToolColours = [
	'rgb(255, 255, 255)',
	'rgb(224, 64, 64',
	'rgb(64, 192, 64)',
	'rgb(88, 176, 245)',
	'rgb(255, 0, 255)',
	'rgb(224, 224, 0)',
	'rgb(255, 255, 255)',
	'rgb(255, 255, 255)',
	'rgb(160, 96, 196)',
]

/**
 * ToolItem is a data class with events
 * for a ToolItemRender type within ToolBox,
 * It will supply information and allow the toolbox
 * build the toolbox and allow it to be floating
 *
 *
 */
export class ToolItem extends React.Component<ToolData, {}> {

	render() {
		const tool = this.props.tool;
		const key = this.props.tool.kind;
		const parent = this.props.toolParent;

		const selected = this.props.isSelected;
		const updateSelected = () => {
			parent.updateSelected(key);
		}

		//TODO: Revisit this
		let iconImg = tool.kindName == 'Selector' ? 
			<SelectOutlined style={{color: 
				ToolColours[tool.kind]}} /> :
				tool.kindName == 'Unselect' ?
			<CloseSquareOutlined style={{color:
				ToolColours[tool.kind]}} /> :
			<CloseSquareFilled style={{color: 
				ToolColours[tool.kind]}} />;
				
		const helpId = tool.helpId || `${tool.kindName.toLowerCase().replace(' ', '_')}_tool`;
		
		return (
			<li 
				key={key} 
				className={selected ? styles.toolSelected : styles.tool}
				onClick={updateSelected}
				data-component={helpId}
				data-help-id={helpId}
			>
				{iconImg}
				<span> </span>{tool.kindName}	
			</li>
		)
	}

}

