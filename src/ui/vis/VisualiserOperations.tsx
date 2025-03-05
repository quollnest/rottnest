import { ReactElement } from "react";

import {
	CELL_SIZE,
	SymbolKindMap,
	SymbolMap,
	CellComp,
	VisCell,
	VisDataLayer,
	ColorConfigMap,
	VisRegion,
	ColorMap}
from "./VisualiserElements";




/**
 * DrawCellProps, used for drawing a cell svg object
 * that would be used by the visualiser
 */
export type DrawCellProps = { rowidx: number, colidx: number, cell: VisCell };

/**
 * TODO: Make sure you add it to the parent
 * CellContents that is added and rendered with a SVG Foreground object
 * Fix the patch key that is being looked at
 */
export function DrawCellContents({rowidx, colidx, cell}: DrawCellProps):
  ReactElement {
  const symkey = cell.type as keyof SymbolKindMap;
  const cellobj = SymbolMap[symkey];
    
  if(cellobj) {
    if("patch" in cellobj) {
      let x = colidx * CELL_SIZE;
      let y = rowidx * CELL_SIZE;

      let text = <use href={cellobj.patch}
				x={x}
				y={y}
      	/>
			return text;
			
    } else {
			
      let x = colidx * CELL_SIZE + CELL_SIZE * 0.5;
      let y = rowidx * CELL_SIZE + CELL_SIZE * 0.55;
      let text = <text
				x={x}
				y={y}
				fontSize={CELL_SIZE * 0.5}
				textAnchor={'middle'}
				dominantBaseline={'middle'}
      >
      { cellobj.text !== undefined ? cellobj.text : '' }
      </text>
    
			return text;      
      
    }
  } else {
  	console.error("Unable to retrieve cellobj"); 
  	return (<></>)
  }
}

/**
 * Draws the lock ontop of a cell
 */
export function DrawLock(cell: CellComp) {
	if(cell[0] === null || cell[1] === null) {
		return (<></>);
	} else {
		const x = cell[1] * CELL_SIZE + CELL_SIZE * 0.2;	
		const y = cell[0] * CELL_SIZE + CELL_SIZE * 0.2;
		const width = CELL_SIZE*0.6;
		const height = CELL_SIZE*0.6;

		return PathRect(x, y, width, height);	
	}
}

/**
 * Draw rout, using the path, returns a path rect based on x, y, width
 * and height
 */
export function DrawRoute(p1: CellComp, p2: CellComp) {
	
	if(p1[0] === null || p1[1] === null
		|| p2[0] === null || p2[1] === null) {
		return (<></>);
	}
	if(Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]) !== 1) {
		return (<></>);
	}

	if(p1[0] === p2[0]) {
		const x = Math.min(p1[1], p2[1]) * CELL_SIZE + CELL_SIZE * 0.8;
    const y = Math.min(p1[0], p2[0]) * CELL_SIZE + CELL_SIZE * 0.2;
		const width = CELL_SIZE*0.4;
		const height = CELL_SIZE*0.6;
		
		return PathRect(x, y, width, height);	
	} else {

		const x = Math.min(p1[1], p2[1]) * CELL_SIZE + CELL_SIZE * 0.2;
    const y = Math.min(p1[0], p2[0]) * CELL_SIZE + CELL_SIZE * 0.8;
		const width = CELL_SIZE*0.6;
		const height = CELL_SIZE*0.4;
		
		return PathRect(x, y, width, height);		
	}
}

/**
 * Draws the base cell which will result in a rounded rectangle
 * with certain defaults.
 * Uses the current row and column index values
 */
export function BaseCell(rowidx: number, colidx: number) {
	const y = (rowidx + 0.1) * CELL_SIZE;
	const x = (colidx + 0.1) * CELL_SIZE;
	const width = CELL_SIZE * 0.8;
	const height = CELL_SIZE * 0.8;

	return RoundedRect(x,y, width, height, 3, 'white', '100%');
}

/**
 * Draws a region within the widget itself.
 * This will return the region and the factories if it
 * does have factories associated with it
 */
export function DrawWidgetRegion(region: VisRegion) {
	const x = region["loc_tl"][1] * CELL_SIZE;
  const y = region["loc_tl"][0] * CELL_SIZE;

  const width = (region["loc_br"][1] - region["loc_tl"][1] + 1) * CELL_SIZE;
  const height = (region["loc_br"][0] - region["loc_tl"][0] + 1) * CELL_SIZE;
	const colorkey = region.name as keyof ColorConfigMap;
  const reg = RoundedRect(x, y, width, height, 3, ColorMap[colorkey],"20%")
	const factories: Array<ReactElement> = [];
	
  if (region.factories !== undefined) {
    for (const factory of region.factories) {
      const xf = (factory["loc_tl"][1] + 0.05) * CELL_SIZE;
      const yf = (factory["loc_tl"][0] + 0.05) * CELL_SIZE;

      const widthf =
        (factory["loc_br"][1] - factory["loc_tl"][1] + 0.9) * CELL_SIZE;
      const heightf =
        (factory["loc_br"][0] - factory["loc_tl"][0] + 0.9) * CELL_SIZE;

      factories.push(RoundedRect(xf, yf, widthf, heightf, 3, "blue", "80%"));
    }
  }

	return [reg, factories]
}

export function DrawBaseLayer(baseLayer: VisDataLayer, width: number, height: number) {
	const cells: Array<ReactElement> = [];
	const contents: Array<ReactElement> = [];
	
	for (let rowidx = 0; rowidx < height; rowidx++) {
    for (let colidx = 0; colidx < width; colidx++) {
      cells.push(BaseCell(rowidx, colidx));
      if (baseLayer.board[rowidx][colidx].type == 'reg') {
      	const cell = baseLayer.board[rowidx][colidx];
        contents.push(DrawCellContents({rowidx, colidx, cell }));
      }
    }
  }
  return [cells, contents]
}

/**
 * Draws the layer, this includes all cells,
 * gates that are held and the locks
 * TODO: Clarify on the layer/draw order
 */
export function DrawLayer(layer: VisDataLayer) {
	const cells: Array<ReactElement> = [];
	const locks: Array<ReactElement> = [];
	const routes: Array<ReactElement> = []; 
	
	for (const [rowidx, row] of layer.board.entries()) {
    for (const [colidx, cell] of row.entries()) {
      cells.push(DrawCellContents({ rowidx, colidx, cell }));
    }
  }
  for (const gate of layer.gates) {
  	if(gate.holds !== undefined) {
	    for (const cell of gate.holds) {
	      locks.push(DrawLock(cell));
	    }
    
	    for (let i = 0; i < gate.holds.length - 1; i++) {
	      routes.push(DrawRoute(gate.holds[i], gate.holds[i + 1]));
	    }
    }
  }
	return [cells, locks, routes]
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

export function DrawDataBackground(data: any) {
	
	
}
