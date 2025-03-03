import { ReactElement } from "react";
import { CELL_SIZE, SymbolKindMap, SymbolMap, VisCell } from "./VisualiserElements";




/**
 * DrawCellProps, used for drawing a cell svg object
 * that would be used by the visualiser
 */
export type DrawCellProps = { rowidx: number, colidx: number, cell: VisCell };

export function DrawCellContents({rowidx, colidx, cell}: DrawCellProps):
  ReactElement {
  const symkey = cell.type as keyof SymbolKindMap;
  const cellobj = SymbolMap[symkey];
    
  if(cellobj) {
    if(cellobj.hasOwnProperty("patch")) {
      let x = colidx * CELL_SIZE;
      let y = rowidx * CELL_SIZE;

      let text = <use
        href={cellobj.patch}
        />
      
    } else {

      
    }
  }
  
  return (<></>)
}

/**
 * Constructs a rounded rectangle
 */
export function RoundedRect(x: number, 
	     y: number, 
	     width: number, 
	     height: number, 
	     radius: number, 
	     fill: string, 
	     fill_opacity: number | string) {

	return <rect 
		x={x} 
		y={y} 
		width={width}
		height={height}
		rx={radius}
		ry={radius}
		fill={fill}
		fillOpacity={fill_opacity}
		stroke={'black'}
		strokeWidth={0.5}
	/>  
}

/**
 * Draws a Path Rectange withing the visualiser
 */
export function PathRect(x: number, y: number, width: number,
		height: number) {

	return <rect 
		x={x} 
		y={y} 
		width={width}
		height={height}
		fill={'orange'}
		fillOpacity={0.3}
		stroke={'black'}
		strokeWidth={0.5}
	/> 
}
