import React from "react";
import {TSchedData} from "../model/TSchedData";
import style from "./styles/SchedulerVisual.module.css"

const prerendered_patches = [
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

const colormap = {
  SingleRowRegisterRegion: "red",
  MagicStateFactoryRegion: "blue",
  RouteBus: "green",
};

const symbolmap = {
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


class SVGObjFactory {
	static CELL_SIZE: number = 100;

	static ElementFnMap: Map<string, any> = new Map(
		[
			['RoundedRect', SVGObjFactory.RoundedRect],
			['PathRect', SVGObjFactory.PathRect],
			['RoundedRect', SVGObjFactory.RoundedRect],
			['RoundedRect', SVGObjFactory.RoundedRect],
			['RoundedRect', SVGObjFactory.RoundedRect],
		]
	);

	static RoundedRect(x: number, 
		     y: number, 
		     width: number, 
		     height: number, 
		     radius: number, 
		     fill: string, 
		     fill_opacity: number) {
	
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

	static BaseCell(rowIdx: number, colIdx: number) {
		const y = (rowIdx + 0.1) * SVGObjFactory.CELL_SIZE;
		const x = (colIdx + 0.1) * SVGObjFactory.CELL_SIZE;

		const width = SVGObjFactory.CELL_SIZE * 0.8;
		const height = SVGObjFactory.CELL_SIZE * 0.8;
		SVGObjFactory.RoundedRect(x, y, width, height, 3, "white", 1.0)	
	}
 
}



type SchedulerControlsData = {
	visualiser: SchedulerVisualiser
}

type SchedulerControlState = {
	data: any
	isPlaying: boolean
	savedPlayingState: any | null
	currentFrame: number
	speedMS: number
	cycle: number
}


type SchedButtonData = { 
	btnText: string
	data: any
	onClickTrigger: (data: any) => void
}
type SchedButtonState = { }

class SchedulerButton extends React.Component<SchedButtonData, 
	SchedButtonState> {

	render() {
		const data = this.props;
		const title = data.btnText;
		return (
			<button onClick={() => data.onClickTrigger(data.data) }>
				{title}
			</button>
		)
	}

}

class SchedulerControls extends React.Component<
	SchedulerControlsData, 
	SchedulerControlState> {

		
	render() {

		const btnComponents = [];

		return (
			<div>
			<span className={style.controlPanel}>

			</span>
			</div>
		)
	}
}

type SchedulerDisplayStateData = {
	svgObj: React.ReactElement
	schedulerDisplayData: SchedulerDisplayData
}

type SchedulerDisplayData = {
	svgData: {
		svgWidth: number | string
		svgHeight: number | string
		//svgDefObjects: Array<React.ReactSVGElement>
		svgBackgroundColour: string
		svgForegroundColour: string
	}

}

class SchedulerDisplay extends React.Component<SchedulerDisplayData, 
	SchedulerDisplayStateData> {

	state: SchedulerDisplayStateData = {
		schedulerDisplayData: {
			svgData: {
				svgWidth: 1,
				svgHeight: 1,
				svgBackgroundColour: 'black',
				svgForegroundColour: 'white',
			}
		},
		svgObj: (<svg></svg>)
	}

	

	getViewBox() {

	}

	zoomIn(event: React.WheelEvent<HTMLDivElement>) {
		//deltaZoom += event.deltaY + event.deltaZ;
		  //var wheelPosition = getPointFromEvent(event);
		  function updateViewBoxBounds() {
		    //var deltaScale = Math.pow(2, deltaZoom / 100);
		    //deltaZoom = 0;
		    /*viewBox.x = wheelPosition.x * (1 - deltaScale) + viewBox.x * deltaScale;
		    viewBox.y = wheelPosition.y * (1 - deltaScale) + viewBox.y * deltaScale;
		    viewBox.height *= deltaScale;
		    viewBox.width *= deltaScale;*/
		  }
		  //requestAnimationFrame(updateViewBoxBounds);
		  event.preventDefault();
	}

	render() {	
		const schDisplay = this;

		return (
			<div className={style.sheduleDisplay}
				onWheel={(e) => schDisplay.zoomIn(e)}>
				
				<svg>

				</svg>

			</div>
		);
	}
}


type SchedulerVisualiserProps = {
	tsched: TSchedData
}


type SchedulerVisualiserState = {

}



export class SchedulerVisualiser extends React.Component {

	

	render() {
		return (
			<div>
				<SchedulerDisplay />
				<SchedulerControls />
			</div>

		)
	}
}

