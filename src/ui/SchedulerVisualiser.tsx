import React from "react";
import style from "./styles/SchedulerVisual.module.css"
import {Workspace, WorkspaceData} from "./workspace/Workspace";

import data_json from '../assets/example_visual.json';

/**
 * SymbolKindMap
 */
type SymbolKindMap = {
	bell: { text: string }
	locked: { text: string }
	reg: { patch: string }
	route: { text: string }
	magic_state: { text: string }
	cultivator: { text: string }
	reserved: { text: string }
	factory_output: { text: string }
	route_buffer: { text: string }
	other: { text: "?" }
}

/**
 * ColorConfigMap provides a description
 * for a few subtypes
 */
type ColorConfigMap = {
	SingleRowRegisterRegion: string
	MagicStateFactoryRegion: string
	RouteBus: string
}

/**
 * PatchData is referencing a file
 * that will be used for rendering
 */
type PatchData = {
	file: string			
	id: string
	width: number
	height: number
}

/**
 * Visualisation data object used by Haowen's original code
 */

/**
 * 
 */
type VisCell = {
	type: string
}


type VisCellLock = {
	type: string
	locked_by: number
}

type VisCellAggr = VisCell | VisCellLock;

type VisGateActive = {
	id: number
	type: string
	active_time: number	
	holds: Array<[number, number]>
} 


type VisGate = VisGateActive;

/**
 * 
 */
type VisDataLayer = {
	board: Array<Array<VisCellAggr>>
	gates: Array<VisGate>
	//factories?: Array<VisFactory>
}

/**
 * 
 */
type VisRegion = {
	name: string
	loc_tl: Array<number>
	loc_br: Array<number>
	factories?: Array<VisRegion>
}

/**
 * 
 */
type VisFactory = {	
	loc_tl: Array<number> 
	loc_br: Array<number>
}

type VisRunResult = {
	width: number
	height: number
	layers: any	
	regions: Array<VisRegion>
}


/**
 * 
 */
type SchedulerControlsData = {
	visualiser: SchedulerVisualiser
}

/**
 * 
 */
type SchedulerControlState = {
	data: any
	isPlaying: boolean
	savedPlayingState: any | null
	currentFrame: number
	speedMS: number
	cycle: number
}


/**
 * 
 */
type SchedButtonData = { 
	btnText: string
	data: any
	onClickTrigger: (data: any) => void
}

/**
 * 
 */
type SchedButtonState = { }


/**
 * 
 */
class SchedulerButton extends React.Component<SchedButtonData, 
	SchedButtonState> {

	render() {
		const data = this.props;
		const title = data.btnText;
		return (
			<button onClick={() => data
				.onClickTrigger(data.data) }>
				{title}
			</button>
		)
	}

}


/**
 * 
 */
class SchedulerControls extends React.Component<
	SchedulerControlsData, 
	SchedulerControlState> {
	
	selfRefControlsData = this.props;
	selfRefStateData = this.state;

	playGroup: Array<SchedButtonData> = [
		{ 
			btnText: "Prev",
			data: {
				controlsData: this.selfRefStateData,
				stateData: this.selfRefStateData,
			},
			
			onClickTrigger: (data: any) => {

			}
		},
		{ 
			btnText: "Play",
			data: {
				controlsData: this.selfRefStateData,
				stateData: this.selfRefStateData,
			},
			onClickTrigger: (data: any) => {

			}
		},
		{ 
			btnText: "Pause",
			data: {
				controlsData: this.selfRefStateData,
				stateData: this.selfRefStateData,
			},
			onClickTrigger: (data: any) => {

			}
		},
		{ 
			btnText: "Next",
			data: {
				controlsData: this.selfRefStateData,
				stateData: this.selfRefStateData,
			},
			onClickTrigger: (data: any) => {

			}
		},
	]

	resetGroup: Array<SchedButtonData> = [
		{
			btnText: "Reset Position",
			data: {

				controlsData: this.selfRefStateData,
				stateData: this.selfRefStateData,
			},
			onClickTrigger: (data: any) => {
				
			}
		}
	];

	saveGroup: Array<SchedButtonData> =[
		{
			btnText: "Reset Position",
			data: {},
			onClickTrigger: (data: any) => {

			}
		}	
	];

		
	render() {

		const playGroup = this.playGroup.map((e, idx) => {
			return (<SchedulerButton 
				{...e} key={idx} />)
		});
		const resetGroup = this.resetGroup.map((e, idx) => {
			return (<SchedulerButton 
				{...e} key={idx} />)
		});

		return (
			<div className={style.scheduleControls}>
			<span className={style.controlPanel}>
				{playGroup}
				{resetGroup}
			</span>
			</div>
		)
	}
}

type SchedulerDisplayStateData = {
	//svgObj: React.ReactElement
	//schedulerDisplayData: SchedulerDisplayData
}

type SchedulerDisplayData = {

	data: any
}


class SchedulerRenderer extends React.Component<
	SchedulerDisplayData, {}>
	 {

	static CELL_SIZE: number = 100;
	static GLOBAL_SCALE: number = 0.4;
	static FRAMERATE: number = 4;

	static PreRenderedPatches: Array<PatchData> = [
		{
			file: "surface_code_double.svg",
			id: "surface_code_double",
			width: 2,
			height: 1,
		},
		{
			file: "surface_code.svg",
			id: "surface_code",
			width: 1,
			height: 1,
		},
	];

	static ColorMap: ColorConfigMap = {
		SingleRowRegisterRegion: "red",
		MagicStateFactoryRegion: "blue",
		RouteBus: "green",
	};
	
	
	static SymbolMap: SymbolKindMap = {
		bell: { text: "🔔" },
		locked: { text: "🔒" },
		reg: { patch: "surface_code" },
		route: { text: "=" },
		magic_state: { text: "✨" },
		cultivator: { text: "🌻" },
		reserved: { text: "⛔" },
		factory_output: { text: "@" },
		route_buffer: { text: "." },
		other: { text: "?" },
	};

	static RoundedRect(x: number, 
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

	static PathRect(x: number, y: number, width: number,
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
	
	tickmarks: any = 
		(<datalist
		className={'px-0 pt-1'}
		style={
			{
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			writingMode: 'vertical-lr'
			}
		}
		></datalist>)

	currentFrame: number = 0;
	data: any = {};
	svgDefs: any = <defs></defs>
	svgFG: any = <g></g>
	svgBG: any = <g></g>
	svg: any = <svg style={
		{
			width: '100%',
			height: 720,
			backgroundColor:'lightgrey', 
			touchAction: 'none' 
		}}>
		{this.svgDefs}
		{this.svgBG}
		{this.svgFG}
	</svg>
	viewBox: any = null;

	constructor(props: any) {
		super(props);
		console.log(this.svg);
		//this.svg.appendChild(this.svgDefs)	
		//this.svg.appendChild(this.svgFG)	
		//this.svg.appendChild(this.svgBG);	
		//this.viewBox = this.svg.viewBox.baseVal;
	}

	drawRoute(p1: [number, number], p2: [number, number]) {
		const CELL_SIZE = SchedulerRenderer
			.CELL_SIZE;

		if (Math.abs(p1[0] - p2[0]) 
		    + Math.abs(p1[1] - p2[1]) != 1) {
			return;
		}
		const  x = Math.min(p1[1], p2[1]) 
			* CELL_SIZE + CELL_SIZE * 0.2;
			
		const y = Math.min(p1[0], p2[0]) 
			* CELL_SIZE + CELL_SIZE * 0.2;
		
		let width = 0; 
		let height = 0;
		if (p1[0] == p2[0]) {
			width = CELL_SIZE * 1.6;
			height = CELL_SIZE * 0.6;
		} else {
			width = CELL_SIZE * 0.6;
			height = CELL_SIZE * 1.6;
		}

		let pr = SchedulerRenderer.PathRect(x, 
						    y, 
						width, 
						height);
		this.svgFG.appendChild(pr);
	}

	drawCellContents(rowIdx: number, 
			colIdx: number, 
			cell: VisCell) {

		const CELL_SIZE: number = 
			SchedulerRenderer.CELL_SIZE;
		const SYMBOL_MAP = 
			SchedulerRenderer.SymbolMap;

		const clltype = 
			cell.type as keyof SymbolKindMap;

		if ("patch" in SYMBOL_MAP[clltype]) {
			const x = colIdx * CELL_SIZE;
			const y = rowIdx * CELL_SIZE;

			const text = <use
				x={x}
				y={y}
				href={`#${SYMBOL_MAP[clltype]
						  .patch}`}
				/>

			this.svgFG.appendChild(text);
		} else {
			const x = colIdx * CELL_SIZE + CELL_SIZE 
				* 0.5;
			const y = rowIdx * CELL_SIZE + CELL_SIZE 
				* 0.55;
				
			const text = (<use
				x={x}
				y={y}
				fontSize={CELL_SIZE * 0.5}
				textAnchor={'middle'}
				dominantBaseline={'middle'}>
			symbolmap[cell.type].text
			</use>);

			
			this.svgFG.appendChild(text);
		}
	}
	
	baseCell(rowIdx: number, colIdx: number) {
		const y = (rowIdx + 0.1) * SchedulerRenderer
			.CELL_SIZE;
		const x = (colIdx + 0.1) * SchedulerRenderer
			.CELL_SIZE;

		const width = SchedulerRenderer.CELL_SIZE * 0.8;
		const height = SchedulerRenderer.CELL_SIZE * 0.8;

		return SchedulerRenderer.RoundedRect(x, y, width, 
						 height, 3, 
					  	"white", 1.0);
	}

	drawWidgetRegion(region: VisRegion) {
		const CELL_SIZE = SchedulerRenderer.CELL_SIZE;
		const x = region.loc_tl[1] * CELL_SIZE;
		
		const y = region.loc_tl[0] * CELL_SIZE;

		let width = (region.loc_br[1] 
			     - region.loc_tl[1] + 1) 
			     * CELL_SIZE;

		let height = (region.loc_br[0] 
			      - region.loc_tl[0] + 1) 
			      * CELL_SIZE;

		const ckey = region.name as keyof ColorConfigMap;
		
		this.svgBG.appendChild(
		    SchedulerRenderer
		    .RoundedRect(x, y, 
				width, 
				height, 3, 
				SchedulerRenderer
				.ColorMap[ckey], 
				"10%")
		);

		if("factories" in region && region.factories) {
			for (const factory of region.factories) {

				const xf = (factory.loc_tl[1] 
					    + 0.05) 
					* CELL_SIZE;

				const yf = (factory.loc_tl[0] 
					    + 0.05) 
					* CELL_SIZE;

				const width =
				(factory.loc_br[1] - 
				 factory.loc_tl[1] + 0.9) 
				* CELL_SIZE;

				const height =
				(factory.loc_br[0] - 
				 factory.loc_tl[0] + 0.9) 
				* CELL_SIZE;
				
				this.svgBG.appendChild(
				      SchedulerRenderer
				      .RoundedRect(xf, yf, 
				      width, 
				      height, 
					  3, 
					"blue", 
					"80%"));
			}
		}
	}

	drawBaseLayer(width: number, height: number) {
		for (var rowIdx = 0; rowIdx < height; rowIdx++) {
			for (var colIdx = 0; colIdx < width; 
			     colIdx++) {
				this.svgBG.appendChild(
					this.baseCell(rowIdx, 
							colIdx));
			}
		}
	}

	drawLayer(layer: VisDataLayer) {
		let board: Array<Array<VisCellAggr>> = layer.board
		for (const [rowIdx, row] of board
		     .entries()) {
			
			for (const [colIdx, cell] of 
			     row.entries()) {
				this.drawCellContents(rowIdx, 
						      colIdx, 
						      cell);
			}
		}
		
		for (const gate of layer.gates) {
			for (let i = 0; i < gate.holds.length - 1; 
			     i++) {	
				this.drawRoute(gate
					       .holds[i], 
					       gate
					       .holds[i+1]);
			}
		}
	}
	
	//TODO: This quite heavily unchecked
	initialiseViewPort() {
		const CELL_SIZE = SchedulerRenderer.CELL_SIZE;
		const svg_offset = 0.05 * CELL_SIZE;
		var svg_width = 
			this.data["width"] 
			* CELL_SIZE + 2 * svg_offset;
		var svg_height = 
			this.data["height"] * 
			CELL_SIZE + 2 * svg_offset;
		this.svg.setAttribute(
		  "viewBox",
		  `${-svg_offset} ${-svg_offset} 
		  ${svg_width} ${svg_height}`
		);

		if (this.viewBox === undefined 
			|| this.viewBox === null) {
			this.viewBox = this.svg.viewBox.baseVal;
		}

		let invertedSVGMatrix = this.svg
			.getScreenCTM().inverse();
		let rect = this.svg.getBoundingClientRect();
		let point = this.svg.createSVGPoint();
		point.x = rect.x;
		point.y = rect.y;
		var viewBoxPos = 
			point
			.matrixTransform(invertedSVGMatrix);
		point.x += rect.width;
		point.y += rect.height;
		var viewBoxEnd = 
			point
			.matrixTransform(invertedSVGMatrix);
		this.viewBox.x = viewBoxPos.x;
		this.viewBox.y = viewBoxPos.y;
		this.viewBox.width = viewBoxEnd.x - viewBoxPos.x;
		this.viewBox.height = viewBoxEnd.y - viewBoxPos.y;
	}

	drawDataBackground() {
		this.svg.setAttribute("width", "100%");
		this.svg.setAttribute("height", "72d0");

		//initialiseViewPort();

		this.svgBG.innerHTML = "";

		for (let region of this.data.regions) {
			this.drawWidgetRegion(region);
		}
		
		this.drawBaseLayer(this.data.width, 
				   this.data.height);
		this.tickmarks.innerHTML = "";

		let i = 0;
		for (i = 0; i < this.data.layers.length + 9; 
		     i += 10) {
			let opt = (<option  
				value={i}
				label={i.toString()}
			/>)
			this.tickmarks.appendChild(opt);
		}

		//frameRange.setAttribute("max", i - 10);
	}

	draw() {
		  this.svgFG.innerHTML = "";
		  this.drawLayer(this.data.layers[
			  this.currentFrame]);
		  //frameBox.value = currFrame;
		  //frameRange.value = currFrame;
	}

	getViewBox() {

	}

	zoomIn(event: React.WheelEvent<HTMLDivElement>) {
		  //deltaZoom += event.deltaY + event.deltaZ;
		  //var wheelPosition = getPointFromEvent(event);
		  function updateViewBoxBounds() {
		    //var deltaScale = Math.pow(2, deltaZoom / 100);
		    //deltaZoom = 0;
		    /*viewBox.x = wheelPosition.x * 
		     * (1 - deltaScale) + viewBox.x * deltaScale;
		    viewBox.y = wheelPosition.y *
		    	(1 - deltaScale) + viewBox.y * deltaScale;
		    viewBox.height *= deltaScale;
		    viewBox.width *= deltaScale;*/
		  }
		  //requestAnimationFrame(updateViewBoxBounds);
		  event.preventDefault();
	}

	render() {
		const schDisplay = this;
		const rsvg = this.svg;
		return (
			<div className={style.sheduleDisplay}
				onWheel={
				(e) => schDisplay.zoomIn(e)
				}>	
			{rsvg}
			</div>
		);
	}
}


type SchedulerVisualiserProps = {
	workspaceData: WorkspaceData
}


type SchedulerVisualiserState = {
	data: VisRunResult | null
	displayState: any 
	controlState: any 
}



export class SchedulerVisualiser extends 
	React.Component<SchedulerVisualiserProps, {}> 
	implements Workspace {
		
	state: SchedulerVisualiserState = {
		data: null,
		controlState: {},
		displayState: {}
	}

	render() {
		let data: VisRunResult = {
			width: data_json.payload.width,
			height: data_json.payload.height,
			//TODO: Resolve the type info here
			layers: data_json.payload.layers,
			regions: data_json.payload.regions,

		}

		//let data = this.props.data;

		if(this.state.data != null) {
			data = this.state.data;
		} else {
			this.state.data = data;
		}
		
		console.log(data);
		return (
			<div className={style.schedulerVisualiser}>
				<SchedulerRenderer data={data} />
			</div>

		)


		//<SchedulerControls 
		//{...this.state.controlState} />
	}
}

