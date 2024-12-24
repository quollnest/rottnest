import React from "react";



/**
 * ToolOperation interface
 * provides a contract that implementers have to 
 * provide which are for:
 * - DesignSpace leftclick, what leftclick does on design space
 * - DesignSpace rightclick, what rightclick does on design space
 * - ToolOptions data, function to perform for tool options
 *  
 */
interface ToolOperation {
	designSpaceLeft(): void
	designSpaceRight(): void
	toolOptions(): void
}

/**
 * ToolItemProps,
 * properties of the selected tool, as given by
 * the container
 *
 */
type ToolItemProps = {
	isSelected: boolean
}

/**
 * ToolItemState,
 * update properties of the tool
 * when it is selected
 *
 * At the moment, nothing has been given
 */
type ToolItemState = {}

/**
 * ToolItem is a data class with events
 * for a ToolItemRender type within ToolBox,
 * It will supply information and allow the toolbox
 * build the toolbox and allow it to be floating
 *
 *
 */
export class ToolItem extends React.Component {

	static ToolWidthDefault: number = 100;
	static ToolHeightDefault: number = 30;
	

	width: number = ToolItem.ToolWidthDefault;	
	height: number = ToolItem.ToolHeightDefault;

	//opertions: ToolOperation;

	/*constructor(oper: ToolOperation) {
		this.opertions = oper;
	}*/

	render() {
		return (
			<>

			</>
		)
	}

}

