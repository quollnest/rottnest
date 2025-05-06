import React, { MouseEvent, ReactElement } from "react";

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

import { Workspace, WorkspaceData } from "../workspace/Workspace.ts";

import style from "../styles/SchedulerVisualiser.module.css"
import { OnVisualiserExportJSON, OnVisualiserFrameNext, OnVisualiserFramePrev, OnVisualiserPlay, OnVisualiserReset, OnVisualiserSaveAnimation, OnVisualiserSaveFrame } from "./VisualiserEvents.ts";
import { DownloadFile } from "../../util/FileDownload.ts";
import { createRoot } from "react-dom/client";


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
			console.log(cellobj.skey);

			const remote = cellobj.remote ? cellobj.remote : ''
			
      let text = <image href={`${remote}`}
      	key={`cell_${rowidx}_${colidx}`}
				x={x}
				y={y}
				width={'100px'}
				height={'100px'}
				fontSize={CELL_SIZE * 0.5}
				textAnchor={'middle'}
				dominantBaseline={'middle'}
      	>
      	</image>
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

/**
 * Draws the base layer of the visualisation image
 */
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
	/> 
}

export function ConstructTickmarks(layerN: number) {
	
	let increment = 1000;
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

	let tickmarks = [];
	for(let i = 0; i < layerN + increment - 1; i += increment) {
		tickmarks.push({ idx: i });
		
	}

	return tickmarks;
}

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

	let tickmarks = [];
	for(let i = 0; i < layerN + increment - 1; i += increment) {
		tickmarks.push({ idx: i });
		
	}

	//TODO: Update the frame range
	const svg_bg = <g>
		{widgetRegions}
		{cells}
		{contents}
		</g>
	console.log(contents);
	return [svg_bg, cells, contents, widgetFactories, widgetRegions];
}


export function DrawVisualInstance(data: VisRunResult, frameNum: number) {

	// re-initialise the foreground element
	
	let layer = DrawLayer(data.layers[frameNum]);
	console.log(layer);
	const svgfg = <g>{layer}</g>
	return [svgfg, layer];
}


export type SchedulerVisData = {
	data: any
	crfrm: number
	nframes: number
	initd: boolean
	isPlaying: boolean
	interval: ReturnType<typeof setInterval> | null
}

export type SchedulerVisProps = {
	workspaceData: WorkspaceData
}

/**
 * Props that will allow you to set the title of the button
 * the onclick operation and the secondary data associated with it
 * 
 */
export type SchedulerButtonProps = {
	title: [string, string | null]
	visParent: SchedulerVisualiser
	onClickOp: (viz: SchedulerVisualiser) => void
	style: string
}

/**
 * Effectively just holds a singular value for input
 * Used to ensure that we move to different frames on change
 *
 */
export type SchedulerFrameData = {
	frame: number
}

/**
 * Just keeps track of the pressed state, useful for the title switching
 */
export type SchedulerButtonData = {
	toggleIdx: number
}


export class SchedulerControlButton extends React.Component<SchedulerButtonProps, SchedulerButtonData>{

	data = {
		toggleIdx: 0
	}

	render() {

		const titles = this.props.title;
		const firstTitle = titles[0];
		const secondTitle = titles[1] != null ? titles[1] : titles[0];
		const renTitles = [firstTitle, secondTitle];

		
		const toggleIdx = this.data.toggleIdx;
		const title = renTitles[toggleIdx];
		const opfn = this.props.onClickOp;
		const viz = this.props.visParent;
		const sname = this.props.style;
		
		return (
			<>
				<button className={style[sname]} onClick={(_e) => { this.data.toggleIdx = (toggleIdx + 1) % 2;
					opfn(viz) }}>
					{title}
				</button>
			</>
		)
	}
}


/**
 * The control state information that
 * is used update/reflect the state of the controls
 */
export type SchedulerControlsProps = {
	isPlaying: boolean
	frameIdx: number
	parent: SchedulerVisualiser
	tickmarks: Array<{idx: number}>
}


export type SchedulerFrameSliderProps = {
	min: number
	max: number
	crfrm: number
	tickmarks: Array<{idx: number}>
}

export function SchedulerFrameSlider(props: SchedulerFrameSliderProps) {

	const min = props.min;
	const max = props.max;
	const crfrm = props.crfrm;
	const tickmarks = props.tickmarks;
	const renOpt = tickmarks.map((o) => <option value={o.idx} label={`${o.idx}`} key={`tm_option_${o.idx}`} /> );
	
	return (<>
		<div className={style.frameContainer}>
		<input className={style.frameSlider} type="range" name="frame" min={min} max={max}
			value={crfrm} onChange={(_) => {}} list="tickmarks" />
		</div>
		<div className={style.frameContainer}>
			<datalist
			id={"tickmarks"}
			className={style.frameTickmarks}>
		{renOpt}
		</datalist>
		</div>
		</>
		
	)
}

/**
 * The scheduler controls that 
 */
export class SchedulerControls extends React.Component<SchedulerControlsProps, {}> {

	

	playRow: Array<SchedulerButtonProps> = [
		{ title: ["Prev", null], visParent: this.props.parent, onClickOp: OnVisualiserFramePrev, style: "ctrlbtn" },
		{ title: ["Play ⏵", "Pause ⏸"], visParent: this.props.parent, onClickOp: OnVisualiserPlay, style: "ctrlplay" },
		{ title: ["Next", null], visParent: this.props.parent, onClickOp: OnVisualiserFrameNext, style: "ctrlbtn" },
		{ title: ["Reset", null], visParent: this.props.parent, onClickOp: OnVisualiserReset, style: "ctrlbtn" },
	];

	saveRow: Array<SchedulerButtonProps> = [
		{ title: ["Save", null], visParent: this.props.parent, onClickOp: OnVisualiserSaveFrame, style: "ctrlbtn_save" },
		{ title: ["Save Animated", null], visParent: this.props.parent, onClickOp: OnVisualiserSaveAnimation, style: "ctrlbtn_save" },
		{ title: ["Export", null], visParent: this.props.parent, onClickOp: OnVisualiserExportJSON, style: "ctrlbtn_save" },
	];


	render() {
		const parent = this.props.parent;
		const fmin = parent.getMin();
		const fmax = parent.getMax();
		const crfrm = this.props.frameIdx;
		const tickmarks: Array<{idx: number}> = this.props.tickmarks;
		const renPlayBtns = this.playRow.map((b) => <SchedulerControlButton {...b} />)	
		const renSaveBtns = this.saveRow.map((b) => <SchedulerControlButton {...b} />)	

		return (
			<div className={style.vizControls}>
				<div className={style.frameLabelContainer}>
					<label className={style.frameLabel}>Cycle Snapshot</label>
				</div>
				<SchedulerFrameSlider min={fmin} max={fmax} crfrm={crfrm} tickmarks={tickmarks}/>
				<div className={style.vizControlRow}>
				{renPlayBtns}
				</div>
				<div className={style.vizControlRow}>
				{renSaveBtns}
				</div>
			</div>
		)
	}
}


export class SchedulerVisualiser extends React.Component<SchedulerVisProps,
	SchedulerVisData> implements Workspace {
		
	
	state: SchedulerVisData = {
		crfrm: 0,
		initd: true,
		isPlaying: false,
		interval: null,
		nframes: this.props.workspaceData.container.getVisData().layers.length,
		data: this.props.workspaceData.container.getVisData(),
	}

	tick() {
		const nframes = this.state.nframes;
		const fmidx = this.state.crfrm;
		this.state.crfrm = (fmidx+1) < nframes ? fmidx + 1 : fmidx;
		this.setState({...this.state})
	}

	togglePlay() {
		this.state.isPlaying = !this.state.isPlaying;
		if(this.state.isPlaying) {
			let self = this;
			this.state.interval = setInterval(() => self.tick(), 500);
			this.setState({...this.state});
		} else {
			if(this.state.interval) {
				clearInterval(this.state.interval);
				this.setState({...this.state})
			}
		}
	}

	getMin() {
		return 0;
	}

	getMax() {
		return this.state.nframes;
	}

	nextFrame() {
		const nframes = this.state.nframes;
		const fmidx = this.state.crfrm;
		this.state.crfrm = fmidx < nframes ? fmidx + 1 : fmidx;
		if(this.state.interval) {
			clearInterval(this.state.interval);
		}
		this.setState({...this.state})
	}

	prevFrame() {
		
		const fmidx = this.state.crfrm;
		this.state.crfrm = fmidx > 0 ? fmidx - 1 : fmidx;
		if(this.state.interval) {
			clearInterval(this.state.interval);
		}
		this.setState({...this.state})
	}

	reset() {	
		this.state.crfrm = 0;
		if(this.state.interval) {
			clearInterval(this.state.interval);
		}
		this.setState({...this.state})
	}

	saveFrame() {
		this.saveSVG(false)
	}


	saveAnimation() {
		this.saveSVG(true);
	}

	saveSVG(isAnimated: boolean) {
		//TODO: Because this is not portable
		const data = this.state.data;
	  
	  if (isAnimated) {
			let svgClone = document.createElement("svg");
	  	const root = createRoot(svgClone);
			
		  root.render(this.renderSVG(data, 0, true));

	  	//TODO: Add in the attribute component here
	    /*svgClone.removeChild(svgClone.lastChild);
	    for (var i = 0; i < data["layers"].length; i++) {
	      svg_fg = document.createElementNS(svgNS, "g");
	      svg_fg.setAttribute("visibility", "hidden");

	      var anim = document.createElementNS(svgNS, "set");
	      anim.setAttribute("id", "frame" + i);
	      anim.setAttribute("attributeName", "visibility");
	      anim.setAttribute("to", "visible");
	      if (i == 0) {
	        anim.setAttribute("begin", `0; frame${data["layers"].length - 1}.end`);
	      } else {
	        anim.setAttribute("begin", `frame${i - 1}.end`);
	      }
	      anim.setAttribute("dur", 1 / FRAMERATE + "s");

	      svg_fg.appendChild(anim);

	      drawLayer(data["layers"][i]);
	      svgClone.appendChild(svg_fg);*/

		  const svgData = new XMLSerializer().serializeToString(svgClone);
		  const b = new Blob([svgData],
		  	{ type:"image/svg+xml" });

			DownloadFile("frame.json", b);
		
	  } else {
	  	//TODO: Check to see if this is working
			const svgClone = document.createElement("svg");
	  	const root = createRoot(svgClone);
		  root.render(this.renderSVG(data, 0, true));

		  const svgData = new XMLSerializer().serializeToString(svgClone);
		  const b = new Blob([svgData],
		  	{ type:"image/svg+xml" });

			DownloadFile("frame.json", b);
		
	  }

	}

	saveJSON() {
	  const b = new Blob([JSON.stringify(this.state.data)],
	  	{ type:"application/json" });

		DownloadFile("unit.json", b);		
	}

	componentDidMount() {
		if(this.state.isPlaying) {
			let self = this;
			this.state.interval = setInterval(() => self.tick(), 100);
		}
	}

	componentWillUnmount() {
		if(this.state.interval) {
			clearInterval(this.state.interval);
		}
	}

	genDefs() {
		const patches = [];
		for(const prp of PreRenderedPatches) {
			
			const patch = (<svg id={prp.id} width={prp.width * CELL_SIZE + 'px'}
				key={`def_patch_${prp.id}`}
				height={prp.height * CELL_SIZE + 'px'}>
				</svg>);
			patches.push(patch);
		}
		console.log(patches);
		return (
			<defs>
				{patches}			
			</defs>
		)
	}

	///TODO: Fix this so it can be used to collect all the components
	renderSVG(data: any, idx: number, baseChange: boolean) {
		
		const defs = this.genDefs();
		const vwidth = (data.width * 100) + 200;
		const vheight = (data.height * 100) + 200;
		if(baseChange) {
			const [sbg, _blayer, _wfactories, _wregions] = DrawDataBackground(data);
			const [sfg, _layer] = DrawVisualInstance(data, idx);

			return (
					<svg viewBox={`0 0 ${vwidth} ${vheight}`} width={'100%'} height={720}>
						{defs}
						{sbg}
						{sfg}
					</svg>
			);
		} else {
			
			const [sfg, _layer] = DrawVisualInstance(data, idx);
			return (
					<svg viewBox={`0 0 ${vwidth} ${vheight}`} width={'100%'} height={720}>
						{sfg}
					</svg>
			);
		}
	}
	

	render() {
		//TODO: Fix this part -> Notice lines 58 to 80 in original
		const data = this.state.data;
		const defs = this.genDefs();
		const vwidth = (data.width * 100) + 200;
		const vheight = (data.height * 100) + 200;
		const [sbg, _blayer, _wfactories, _wregions] = DrawDataBackground(data);
		const [sfg, _layer] = DrawVisualInstance(data, this.state.crfrm);
		const tickmarks = ConstructTickmarks(data.layers.length);

		const mouseDownHandler = (_e: MouseEvent<SVGElement>) => {
			//TODO: Fix this			
		};

		const mouseUpHandler = (_e: MouseEvent<SVGElement>) => {
			//TODO: Fix this
		};
		

		//const svginst = this.state.svgd;
		//ratio: 1:100
		//TODO: Make it moveable and make it playable
		const frameIdx = this.state.crfrm;
		const isPlaying = this.state.isPlaying;
		const self = this;
		return (
			<>
				<svg viewBox={`-100 -100 ${vwidth} ${vheight}`} width={'100%'} height={720} style={{backgroundColor: 'grey'}}
					onMouseDown={mouseDownHandler} onMouseUp={mouseUpHandler}>
					{defs}
					{sbg}
					{sfg}
				</svg>
				<SchedulerControls frameIdx={frameIdx} isPlaying={isPlaying} parent={self} tickmarks={tickmarks}/>
			</>
		);
		
	}

	
}
