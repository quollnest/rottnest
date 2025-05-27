import React, { MouseEvent } from "react";

import { Workspace, WorkspaceData } from "../../workspace/Workspace.ts";
import { DownloadFile } from "../../../util/FileDownload.ts";
import { OnRangeChange, OnVisualiserExportJSON, OnVisualiserFrameNext, OnVisualiserFramePrev, OnVisualiserPlay, OnVisualiserReset, OnVisualiserSaveAnimation, OnVisualiserSaveFrame } from "./VisualiserEvents.ts";

import style from "./styles/GimSchedulerVisualiser.module.css"
import { VisualiserFrame } from "./VisualiserFrame.tsx";

export const FRAMERATE: number = 60;


//
// Utilising the tickmarks from previous visualiser
// 
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
	for(let i = 1; i <= layerN + increment - 1; i += increment) {
		tickmarks.push({ idx: i-1 });
	}
	return tickmarks;
}


export type GimFCSchedulerVisData = {
	data: any
	crfrm: number
	initd: boolean
	isPlaying: boolean
	offsets: [number, number]
	midDown: boolean
	interval: ReturnType<typeof setInterval> | null
}

//
// Visual Props for the Fully Connected graph props
// 
export type GimFCSchedulerVisProps = {
	workspaceData: WorkspaceData
}

/**
 * Props that will allow you to set the title of the button
 * the onclick operation and the secondary data associated with it
 * 
 */
export type GimFCSchedulerButtonProps = {
	title: [string, string | null]
	visParent: GimFCVisualiser
	onClickOp: (viz: GimFCVisualiser) => void
	style: string
}

/**
 * Effectively just holds a singular value for input
 * Used to ensure that we move to different frames on change
 *
 */
export type GimFCSchedulerFrameData = {
	frame: number
}

/**
 * Just keeps track of the pressed state, useful for the title switching
 */
export type GimFCSchedulerButtonData = {
	toggleIdx: number
}


export class GimFCSchedulerControlButton
extends React.Component<GimFCSchedulerButtonProps, GimFCSchedulerButtonData>{

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
export type GimFCSchedulerControlsProps = {
	isPlaying: boolean
	frameIdx: number
	parent: GimFCVisualiser
	tickmarks: Array<{idx: number}>
}

//
// Slider Props for the visualiser, could generalise this
// 
export type GimFCSchedulerFrameSliderProps = {
	min: number
	max: number
	crfrm: number
	tickmarks: Array<{idx: number}>
	parent: GimFCVisualiser
}

//
// Renderer for the slider
// 
export function GimFCSchedulerFrameSlider(props: GimFCSchedulerFrameSliderProps) {

	const min = props.min;
	const max = props.max;
	const crfrm = props.crfrm;
	const tickmarks = props.tickmarks;
	const vis = props.parent;
	const renOpt = tickmarks.map((o) => {
		if(o.idx === 0) {	
			return <option value={o.idx} label={`${o.idx+1}`}
			  key={`tm_gim_option_${o.idx}`} />
		} else if(o.idx === max) {
			return <option value={o.idx-1} label={`${o.idx}`}
			   key={`tm_gim_option_${o.idx}`} />
		} else {
			return <option value={o.idx} label={`${o.idx}`}
			  key={`tm_gim_option_${o.idx}`} />
		}
	});
	
	return (<>
		<div className={style.frameContainer}>
		<input className={style.frameSlider} type="range" name="frame" min={min} max={max}
			value={crfrm} onChange={(e) => {
				OnRangeChange(vis, Number(e.target.value))
			}} list="tickmarks" />
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
export class GimFCSchedulerControls
  extends React.Component<GimFCSchedulerControlsProps, {}> {

	playRow: Array<GimFCSchedulerButtonProps> = [
		{ title: ["Prev", null], visParent: this.props.parent, onClickOp: OnVisualiserFramePrev, style: "ctrlbtn" },
		{ title: ["Play ⏵", "Pause ⏸"], visParent: this.props.parent, onClickOp: OnVisualiserPlay, style: "ctrlplay" },
		{ title: ["Next", null], visParent: this.props.parent, onClickOp: OnVisualiserFrameNext, style: "ctrlbtn" },
		{ title: ["Reset", null], visParent: this.props.parent, onClickOp: OnVisualiserReset, style: "ctrlbtn" },
	];

	saveRow: Array<GimFCSchedulerButtonProps> = [
		{ title: ["Save", null], visParent: this.props.parent, onClickOp: OnVisualiserSaveFrame, style: "ctrlbtn_gim_save" },
		{ title: ["Save Animated", null], visParent: this.props.parent, onClickOp: OnVisualiserSaveAnimation, style: "ctrlbtn_gim_save" },
		{ title: ["Export", null], visParent: this.props.parent, onClickOp: OnVisualiserExportJSON, style: "ctrlbtn_gim_save" },
	];


	render() {
		const parent = this.props.parent;
		const fmin = parent.getMin();
		const fmax = parent.getMax();
		const crfrm = this.props.frameIdx;
		const tickmarks: Array<{idx: number}> = this.props.tickmarks;
		const renPlayBtns = this.playRow
			.map((b, i) => <GimFCSchedulerControlButton key={`sch_gim_play_${i}`} {...b} />)	
		const renSaveBtns = this.saveRow
			.map((b, i) => <GimFCSchedulerControlButton key={`sch_gim_save_${i}`} {...b} />)	
		

		return (
			<div className={style.vizControls}>
				<div className={style.frameLabelContainer}>
					<label className={style.frameLabel}>Cycle Snapshot</label>
				</div>
				<GimFCSchedulerFrameSlider parent={parent}
					min={fmin} max={fmax} crfrm={crfrm} tickmarks={tickmarks}/>
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

//
// This is a test class just to show that the visualiser is able to work and fix things
// as they come rather than supplying a full implementation
// 
export class GimTestVisualiser extends React.Component<GimFCSchedulerVisProps,
	GimFCSchedulerVisData> implements Workspace {
	render() {
		const frame = <VisualiserFrame frameNo={0} />

		return (
			<>
				{frame}
			</>
		)
	}


}


export class GimFCVisualiser extends React.Component<GimFCSchedulerVisProps,
	GimFCSchedulerVisData> implements Workspace {
		
	
	state: GimFCSchedulerVisData = {
		crfrm: 0,
		initd: true,
		isPlaying: false,
		interval: null,
		data: this.props.workspaceData.container.getVisData(),
		offsets: [0, 0],
		midDown: false,
	}

	tick() {
		const nframes = this.getMax();
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
		return this.state.data.layers.length;
	}

	nextFrame() {
		const nframes = this.getMax();
		const fmidx = this.state.crfrm;

		this.state.crfrm = fmidx < (nframes-1) ? fmidx + 1 : fmidx;
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

	/// We construct a static markup and componentise everything
	saveSVG(_isAnimated: boolean) {}

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


	
	changeFrame(v: number) {
		const nstate = {...this.state};
		nstate.crfrm = v;
		this.setState(nstate);
	}


	render() {
		const data = this.state.data;
		const vwidth = (data.width * 100) + 200;
		const vheight = (data.height * 100) + 200;
		const tickmarks = ConstructTickmarks(data.layers.length);
		const self = this;


		const mouseDownHandler = (e: MouseEvent<SVGElement>) => {

			if(e.button === 1) {
				
				const x = e.movementX;
				const y = e.movementY;

				const nState = {...this.state};
				const [oX, oY] = nState.offsets;

				const nPos: [number, number] = [
					oX + x,
					oY + y
				];

				nState.offsets = nPos;
				nState.midDown = true;

				this.setState(nState);
			}
			
		};

		const mouseMove = (e: MouseEvent<SVGElement>) => {
			if(self.state.midDown) {
				
			const x = e.movementX;
			const y = e.movementY;

			let newGS = {...this.state};
			let [oX, oY] = newGS.offsets;
			newGS.offsets = [
				oX + x,
				oY + y
			];
			this.setState(newGS);
			}	
		}

		const mouseUpHandler = (e: MouseEvent<SVGElement>) => {
			if(e.button === 1) {
				
				const x = e.movementX;
				const y = e.movementY;

				const nState = {...this.state};
				const [oX, oY] = nState.offsets;

				const nPos: [number, number] = [
					oX + x,
					oY + y
				];

				nState.offsets = nPos;
				nState.midDown = false;

				this.setState(nState);
			}
		};
		
		const [ox, oy] = self.state.offsets;
		//const svginst = this.state.svgd;
		//ratio: 1:100
		//TODO: Make it moveable and make it playable
		const frameIdx = this.state.crfrm;
		const isPlaying = this.state.isPlaying;
		return (
			<>
				<svg viewBox={`${-100-ox} ${-100-oy} ${vwidth} ${vheight}`} width={'100%'} height={720} style={{backgroundColor: 'grey'}}
					onMouseDown={mouseDownHandler} onMouseUp={mouseUpHandler}
					onMouseMove={mouseMove}>
				</svg>
				<GimFCSchedulerControls frameIdx={frameIdx} isPlaying={isPlaying} parent={self} tickmarks={tickmarks}/>
			</>
		);
		
	}

	
}

