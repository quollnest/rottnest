import React, { ReactElement } from "react";

import {
	CELL_SIZE,
	SymbolKindMap,
	SymbolMap,
	CellComp,
	VisCell,
	VisDataLayer,
	ColorConfigMap,
	VisRegion,
	ColorMap,
    VisRunResult,
    PreRenderedPatches}
from "./VisualiserElements";

import vizexample from '../../assets/example.json';

import { Workspace, WorkspaceData, WorkspaceProps } from "../workspace/Workspace";




/**
 * DrawCellProps, used for drawing a cell svg object
 * that would be used by the visualiser
 */
export type DrawCellProps = { rowidx: number, colidx: number,
	cell: VisCell };

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

      let text = <use href={`#${cellobj.skey}`}
      	key={`cell_${rowidx}_${colidx}`}
				x={x}
				y={y}
				fill={'black'}
				stroke={'black'}
				width={'100px'}
				height={'100px'}
				fontSize={CELL_SIZE * 0.5}
				textAnchor={'middle'}
				dominantBaseline={'middle'}
      	/>
			return text;
			
    } else {
      let x = colidx * CELL_SIZE + CELL_SIZE * 0.5;
      let y = rowidx * CELL_SIZE + CELL_SIZE * 0.55;
      let text = <text
      	key={`cell_${rowidx}_${colidx}`}
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

//	const _sbg = DrawDataBackground(this.state.svgbg, this.state.svg,
//		data);
//	const _cly = DrawVisualInstance(this.state.svgfg, data,
//		this.state.crfrm);
export function DrawDataBackground(data: VisRunResult) {


	const width = data.width;
	const height = data.height;

	let widgetFactories = [];
	let widgetRegions = [];
	console.log(data);
	for(const reg of data['regions']) {
		const [region, factory] = DrawWidgetRegion(reg);

		widgetRegions.push(region);
		widgetFactories.push(factory);
		
	}

	let [cells, contents] = DrawBaseLayer(data.base_layer, width, height);

	let increment = 1000;
	const layerN = data.layers.length
	if(layerN < 500) {
		increment = 10;
	} else if(layerN < 1000) {
		increment = 20;
	} else if(layerN < 5000) {
		increment = 100;
	} else if (layerN < 10000) {
		increment = 200;
	} else {
		increment = 1000;
	}

	let optelements = [];
	let i = 0;
	for(i = 0; i < layerN + increment - 1; i += increment) {
		let opt = <option value={i} label={`${i}`} key={`tm_option_${i}`} />
		optelements.push(opt);
		
	}

	
	let tickmarks = <datalist
			id={"tickmarks"}
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				writingMode: 'vertical-lr'
			}}
		>
		{optelements}
		</datalist>

	//TODO: Update the frame range
	const svg_bg = <g>
		{widgetRegions}
		{cells}
		{contents}
		</g>
	console.log(contents);
	return [svg_bg, cells, contents, tickmarks,widgetFactories, widgetRegions];
}


export function DrawVisualInstance(data: VisRunResult, frameNum: number) {

	// re-initialise the foreground element
	
	let layer = DrawLayer(data.layers[frameNum]);

	//TODO: update frameBox 
	const svgfg = <g>{layer}</g>
	return [svgfg, layer];
}


export type SchedulerVisData = {
	crfrm: number
	initd: boolean
}

export type SchedulerVisProps = {
	workspaceData: WorkspaceData
}


export class SchedulerVisualiser extends React.Component<SchedulerVisProps,
	SchedulerVisData> implements Workspace {
		

	state: SchedulerVisData = {
		crfrm: 0,
		initd: true
	}

	genDefs() {
		const patches = [];
		for(const prp of PreRenderedPatches) {
			
			const patch = (<svg id={prp.id} width={prp.width * CELL_SIZE + 'px'}
				key={`def_patch_${prp.id}`}
				height={prp.height * CELL_SIZE + 'px'}>
				</svg>);
			patches.push(patch);
			//this.state.svgdefs.appendChild(patch);
		}
		return (
			<defs>
				{patches}			
			</defs>
		)
	}

	render() {
		//TODO: Fix this part -> Notice lines 58 to 80 in original
		const runresult = vizexample;
		const data = runresult;
		const defs = this.genDefs();
		const vwidth = (data.width * 100) + 200;
		const vheight = (data.height * 100) + 200;
		const [sbg, _blayer, _tickmarks, _wfactories, _wregions] = DrawDataBackground(data);
		const [sfg, _layer] = DrawVisualInstance(data, this.state.crfrm);

		//DrawDataBackground
		//DrawVisualInstance

		//const svginst = this.state.svgd;
		//ratio: 1:100
		//TODO: Make it moveable and make it playable
		return (
			<>
				<svg viewBox={`-100 -100 ${vwidth} ${vheight}`} width={'100%'} height={720} >
					{defs}
					{sbg}
					{sfg}
				</svg>
			</>
		);
		
	}

	
}
