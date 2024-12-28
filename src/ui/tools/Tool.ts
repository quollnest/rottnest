import Toolbox from "../Toolbox"

/**
 * ToolOperation interface
 * provides a contract that implementers have to 
 * provide which are for:
 * - DesignSpace leftclick, what leftclick does on design space
 * - DesignSpace rightclick, what rightclick does on design space
 * - ToolOptions data, function to perform for tool options
 *  
 */
export interface ToolOperation {
	designSpaceLeft(): void
	designSpaceRight(): void
	toolOptions(): void
}


export type Tool = {
	kind: number
	kindName: string
	imageUrl: string
	events: ToolOperation
	description: string
}


export type ToolData = {
	tool: Tool
	isSelected: boolean
	toolParent: Toolbox 
}
