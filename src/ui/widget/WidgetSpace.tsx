import React from "react";
import {WorkspaceData} from "../workspace/Workspace";
import styles from '../styles/WidgetSpace.module.css'
import {WorkspaceBufferMap} from "../workspace/WorkspaceBufferMap";
import {CUReqResult, CUVolumeDummy, WidgetGraph} from "../../model/WidgetGraph";
import {ASContextHook} from "../../net/AppService";
import {AppServiceMessage} from "../../net/AppServiceMessage";
import {RottStatusResponseMSG} from "../../net/Messages";

type WidgetViewState = { 
	cunitMap: Map<string, CUReqResult>
}

type LineStackEntry = {
	x1: number
	x2: number
	y1: number
	y2: number
}

type WidgetLayerEntry = {
	entryIdx: number
	parentIdx: number
}

type WidgetTreeLayerData = {
	depth: number
	firstIdx: number
	layerElements: Array<WidgetLayerEntry>
}


type WidgetTreeDisplayData = {
	layerData: Array<WidgetTreeLayerData>
}





/**
 * This will be aggregation of all the widget data,
 * we will have a selected index that allows the
 * component to select it and represent it
 *
 */
type WidgetAggr = {
	graph: WidgetGraph
	workspaceData: WorkspaceData
}

type WidgetDispData = {
	wdaggr: WidgetAggr
	index: number
	selectedIdx: number
	cuId: string
	x: number
	y: number
	cuReqData: CUReqResult | null
}

type WidgetObjectData = {
	x: number
	y: number
	actualPosition: boolean
	moveMode: boolean
}

/**
 * WidgetObject, 
 */
class WidgetObject extends React.Component<WidgetDispData, 
	WidgetObjectData> {
	
	cuIndex = this.props.index;
	cuId = this.props.cuId
	//TODO: Don't look, it is awful
	apservice = this.props.wdaggr
		.workspaceData.container
		.commData.appService;


	state: WidgetObjectData = {
		x: this.props.x,
		y: this.props.y,
		actualPosition: false,
		moveMode: false
	}

	data: {
		bufferMap: WorkspaceBufferMap
		idx: number
		selectedIdx: number
	} = {
		bufferMap: this.props.wdaggr
			.workspaceData
			.bufferMap,
		idx: this.props.index,
		selectedIdx: this.props
			.selectedIdx
		
	}

	/**
	 * 
	 */
	onHoverTrigger() {

		//1. Trigger an update on the panel
		this.data.bufferMap.insert('current_node', 
		JSON.stringify({
			idx: this.data.idx 
		}));	
		this.data.bufferMap.commit();
	}

	onNodeMove(e: React.MouseEvent<HTMLDivElement>) {
		if(this.state.moveMode) {
			
			
		
			const nx = e.clientX;
			const ny = e.clientY;
			
			let nState = {...this.state};
			nState.x = nx;
			nState.y = ny;
			this.setState(nState);
		}
	}

	onNodeMouseUp(e: React.MouseEvent<HTMLDivElement>) {

		const btn = e.button;
		if(btn === 1) {
			console.log('release');
			let nState = {...this.state};
			nState.moveMode = false;
			this.setState(nState);
		}
	}

	onNodeMouseDown(e: React.MouseEvent<HTMLDivElement>) {
		const btn = e.button;

		if(btn === 1) {
					
			const nx = e.clientX;
			const ny = e.clientY;
			let nState = {...this.state};
			nState.x = nx;
			nState.y = ny;
			nState.moveMode = true;
			nState.actualPosition = true;
			
			this.setState(nState);

		} else if(btn === 0) {
			if(this.props.cuReqData === null ||
			  this.props.cuReqData.status !== 'complete') {
				this.apservice.sendObj('get_status', {
					'cu_id': this.cuId
				});
			}
			if(this.data.idx !== this.data.selectedIdx) {
				let nnode = {
					idx: this.data.idx
				};
				const nstr = JSON.stringify(nnode);
				this.data.bufferMap
					.insert('root_node',
						nstr);	
				this.data.bufferMap
					.insert('next_node',
						nstr);

				this.data.bufferMap.commit();
			}
		}	

	}		


	render() {


			
		const index = this.props
			.index;
		const widget = this.props.wdaggr
			.graph.graph[index];
		
		const cuObj = this.props.cuReqData;
		
		let tsourceInfo = { 
			contents: false,
			info: 'No Info',
			mappedData: new Map()
		};
		let cuVolume = CUVolumeDummy();
		let cuDetailsReady = false;
		let status = 'not_checked';
		if(cuObj !== null) {
			status = cuObj.status;
			if(cuObj.status === 'complete') {
				cuDetailsReady = true;
				cuVolume = cuObj.volumes;
				tsourceInfo.contents =  true;
				tsourceInfo.info = 'Info';
				for(const tkey in cuObj.t_source) {
					tsourceInfo.mappedData.set(tkey,
							cuObj.t_source[tkey]);

				}
			} else if(cuObj.status === 'not_found') {

			} else if(cuObj.status === 'not_ready') {
				status = 'not_ready';
			}
		}
		let tdata = null;		
		if(tsourceInfo.contents) {
			tdata = tsourceInfo.mappedData
				.entries()
				.map((e) => {
				const [ky, vl] = e; 
				return (
					<div>
					{ky}:{vl}	
					</div>
				)

			});
		}
		const tDisp = tdata === null ? 
			<div>No Data Available</div> :
			<div>
				<header>T Source Info</header>
				{tdata}
			</div>

		const volDisp = cuDetailsReady ? 
			(<div>
			 	<header>
				{this.cuId}
				</header>
				<div>
				Test Description
				</div>
			 	<header>
				Volumes
				</header>
				<div>
					<div><span>Reg.Vol: </span>
					<span>{cuVolume.REGISTER_VOLUME}</span></div>
					<div><span>Fac.Vol: </span>
					<span>{cuVolume.FACTORY_VOLUME}</span></div>
					<div><span>Rout.Vol: </span>
					<span>{cuVolume.ROUTING_VOLUME}</span></div>
					<div><span>TIdle.Vol: </span>
					<span>{cuVolume.T_IDLE_VOLUME}</span></div>
				</div>
				{tDisp}
			 </div>)
			:
			(<div>
			 Data Not Ready
			 </div>);

		let x = `${this.state.x-25}`;
		let y = `${this.state.y-25}`;
		let sObj = { left: `${x}px`,top: `${y}px`,
			position: 'fixed' };
		if(!this.state.actualPosition) {

			x = `${this.state.x}%`;
			y = `${this.state.y}%`;
			sObj = {
				left: `calc(${x} - 25px)`,top: `${y}`,
				position: 'absolute' }

		} 
		return (
			<div style={sObj}
				className={styles.widgetObject}
				onMouseEnter={(_) => { 
					this.onHoverTrigger()}}
				onMouseDown={(e) => { this
					.onNodeMouseDown(e)}}
				onMouseUp={(e) => {this
					.onNodeMouseUp(e)}}
				onMouseMove={(e) => this.onNodeMove(e)}>
				
				<header 
					className={
						styles
						.widgetObjectHeader}>
					{widget.cu_id}
				</header>
				<div className={styles
					.widgetObjectBody}>
				{widget.description}
				</div>
				<div className={
						styles.cuStatus}>
					{status}	
				</div>
			</div>
		);
	}

}



export class WidgetSpace extends 
	React.Component<WorkspaceData, WidgetViewState> 
	implements ASContextHook {
	
	state = {	
		cunitMap: new Map(),
	}

	constructor(props: any) {
		super(props);
		const container = this.props.container;
		const aService = container.commData.appService;
		aService.hookContext(this,'status_response');
	}
	
	serviceHook(asm: AppServiceMessage): void {
		const jsonObj = asm.getJSON()
		//Your response here
		//Turn it into a CUReqResult		
		if(jsonObj) {
			const containerMsg 
				= new RottStatusResponseMSG();
			const rData = asm
				.parseDataTo(containerMsg);	
			if(rData) {
				const cuData = rData
					.curesult;
				this.state.cunitMap	
					.set(cuData.cu_id,
					     cuData);
				this.props.bufferMap.insert('node_column',
							   JSON.stringify(cuData));
				const nState = {...this.state}
				this.setState(nState);
			}
			
		}
	}

	traverseGraph(graph: WidgetGraph, 
		      rootIdx: number)
		: WidgetTreeDisplayData {
		const collection = graph.graph;
		//depth, parentIdx, entryIdx	
		let queue: Array<[number, number, number]> 
			=[[0,-1, rootIdx]];
		let seenList: Set<number> = new Set();
		let traversalData: Array<WidgetTreeLayerData> = [];
		let current: [number, number, number] 
			| undefined = undefined;

		while(queue.length > 0) {
			current = queue.shift();
			if(!current) { continue; }
			
			const [depth, parentIdx, idx] = current;
			console.log(graph);
			const currentWidget = collection[idx];
			if(currentWidget === undefined) {
				return { layerData: [] };
			}
			const element = {
				entryIdx: idx,
				parentIdx
			};

			if(depth >= traversalData.length) {
				traversalData.push(
					{
						depth,
						layerElements:[
							element
						],
						firstIdx: idx
					}
				);
			} else {
				traversalData[depth]
				.layerElements.push(element);	
			}
			

			//add children
			for(let i = 0; i < currentWidget
			    .children.length; i++) {
				const childIdx = currentWidget
					.children[i];
				if(!seenList.has(childIdx)) {
					seenList.add(childIdx);
					queue.push([depth+1, idx, 
						   childIdx]);
				}
			}
		}
		console.log(traversalData);

		return {
			layerData: traversalData	
		}
	}

	render() {
		
		//TODO: We need to re-calculat the height
		//let newHeight = 100;
		//TODO: We need to uncap the height and allow
		//moving of the design space
		let calcdHeight = 0;
		const bmap = this.props.bufferMap;
		//TODO: We need to retrieve the graph information
		//	and update the details
		const graphFromContainer = this.props.container
			.getWidgetGraph();
		const waggr: WidgetAggr = {
			graph: graphFromContainer,
			workspaceData: this.props
		}

		let selectedIndex = 0;
		const selectedData = JSON.parse(
			bmap.get('root_node'));
		if(selectedData !== null) {
			selectedIndex = selectedData.idx;
		}
	
	       	let prevWlen = 100;
		let prevLayer: WidgetTreeLayerData | null = null;
		let lineStack: Array<LineStackEntry> = [];

		const renderedWidgets = this.traverseGraph(
			graphFromContainer, selectedIndex
		).layerData
		.map((wl: WidgetTreeLayerData, _: number) => {
			

			const wlLength = wl.layerElements.length;
			calcdHeight += 20;
			const wlRes = wl.layerElements
			.map((w: WidgetLayerEntry, idx: number) => {
				const wname = waggr
					.graph
					.graph[w.entryIdx].cu_id
					
				const xperc = (100 / (wlLength*2));
				const xdisp = (xperc * (idx +1)) + 
					(xperc * idx);

				const cuVal = this.state.cunitMap.get(wname);
				const distCU = cuVal !== null && cuVal !== undefined ?
					cuVal : null;

				const wdispData = {
					wdaggr: waggr,
					index: w.entryIdx,
					x: xdisp,
					y: wl.depth * 20,
					selectedIdx: selectedIndex,
					cuReqData: distCU,
					cuId: wname,
				};

				//Compute line between child and parent
				//We need to know if the parent 
				//is starting or not
				
				let pLayerFirstIdx = -1;
				if(prevLayer !== null) {
					pLayerFirstIdx = prevLayer
					.firstIdx;
				}
				const pIdx = w.parentIdx;
				const pDiff = pLayerFirstIdx - pIdx;
				const pDepth = wl.depth-1;
				const parentXPerc = (100 / 
						     (prevWlen*2));
				let parentXDisp = (parentXPerc 
						   * (pIdx +1)) + 
					(pIdx * pIdx);

				//TODO: Not certain about this
				if(pDiff === 0 && pDepth > 0) {
					parentXDisp = parentXDisp/2;
				}


				const line = {
					x1: wdispData.x,
					y1: wdispData.y,
					x2: parentXDisp,
					y2: pDepth * 20
				};

				lineStack.push(line);
				return (
					<WidgetObject key={wname}
					{...wdispData}/>
				);
			});

			prevWlen = wlLength; 
			//Used for drawing lines between nodes
			prevLayer = wl;
			calcdHeight += 25;

			return wlRes;
		});

		//Construct svg with lines
		const svgLines = lineStack.map((l, idx) => {
			return <line key={`cu${idx}`} 
				x1={`${l.x1}%`} 
				x2={`${l.x2}%`} 
				y1={`${l.y1}%`} 
				y2={`${l.y2+2}%`} stroke={'white'} 
					strokeWidth={'1'}
			/>
		});

		return (
			<div className={styles.widgetSpace}
			style={{height: `${calcdHeight}%`}}>
				{renderedWidgets}
				<svg className={styles
					.widgetSVGLineStack}>
					{svgLines}
				</svg>
			</div>
		)
	}
}

