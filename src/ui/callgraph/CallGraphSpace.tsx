import React, {CSSProperties} from "react";
import {WorkspaceData} from "../workspace/Workspace";
import styles from '../styles/CGSpace.module.css'
import {WorkspaceBufferMap} from "../workspace/WorkspaceBufferMap";
import {CUReqResult,
	RottCallGraph,
	RottCallGraphEntryDefault,
	RottGraphEntry} from "../../model/CallGraph";
import {ASContextHook} from "../../net/AppService";
import {AppServiceMessage} from "../../net/AppServiceMessage";
import {RottStatusResponseMSG} from "../../net/Messages";
import {CGChartSpace, CGSample} from "./CGChart";

const PreMadeData = [
	genData(20),
	genData(20),
	genData(20)
];

interface CGUpdateableContext {	
	pushPositionUpdate(pdata: CGLinePositionData): void
	getCoords(): CGObjectLineUpdatable 
}

interface CGUpdatable {	
	pushPositionUpdate(pdata: CGLinePositionData): void
	registerContext(ctx: CGUpdateableContext): void
	getCoords(): CGObjectLineUpdatable	
}

function genData(n: number): Array<CGSample> {
	const data: Array<CGSample> = [];
	const nodesRan = [
		'0_0',
		'0_0s',
		'0_1'
	]
	for(let i = 0; i < n; i++) {
		data.push({
			
			widgetIdx: i+1,
			refId: nodesRan[i%3],
			cuVolume: {
			REGISTER_VOLUME: 10000 + (Math.random() * 1999),
			FACTORY_VOLUME: 9000 + (Math.random() * 1999),
			ROUTING_VOLUME: 8000 + (Math.random() * 1999),
			T_IDLE_VOLUME: 7000 + (Math.random() * 1999),
			}
		})
	}
	return data;
}


class UpdatableLineRef implements CGUpdatable {
	
	ctx: CGUpdateableContext | null = null;

	getCoords(): CGObjectLineUpdatable {
		if(this.ctx) { 
			return this.ctx.getCoords(); 
		}
		else {
			return {
				updateable: this, 
				pairUnit1: '%', 
				pairUnit2: '%', 
				x1: 0,
				x2: 0,
				y1: 0,
				y2: 0
			}
		}
	}

	pushPositionUpdate(pdata: CGLinePositionData): void {
		if(this.ctx) {
			this.ctx.pushPositionUpdate(pdata);
		}
			
	}

	registerContext(ctx: any): void {
		this.ctx = ctx;
	}
}

type CGPositionData = {
	x: number
	y: number
	depth: number
	parent: string
}

type CGViewState = { 
	dispPositions: Map<string, CGPositionData> 
	//The x1, y1 position
	srcPositions: Map<string, Map<string, CGUpdatable>>
	//The x2, y2 position
	destPositions: Map<string, Map<string, CGUpdatable>>
	cunitMap: Map<string, CUReqResult>
	//registerMap: Map<string, CGObjectLine>
	refresh: boolean
}

type CGLayerEntry = {
	entryIdx: string 
	parentIdx: string
}

type CGTreeLayerData = {
	depth: number
	layerElements: Array<CGLayerEntry>
}


type CGTreeDisplayData = {
	layerData: Array<CGTreeLayerData>
}


/**
 * This will be aggregation of all the widget data,
 * we will have a selected index that allows the
 * component to select it and represent it
 *
 */
type CGAggr = {
	graph: RottCallGraph 
	workspaceData: WorkspaceData
}

type CGDispData = {
	wdaggr: CGAggr
	index: string 
	selectedIdx: string
	cuId: string
	x: number
	y: number
	cuReqData: CUReqResult | null
	updateTrigger: (idx: string, data: CGPositionData) => void
}

type CGObjectData = {
	x: number
	y: number
	actualPosition: boolean
	moveMode: boolean
	cuReady: boolean
	dataReady: boolean
}

/**
 * CGObject, 
 */
class CGObject extends React.Component<CGDispData, 
	CGObjectData> {
	
	cuIndex = this.props.index;
	cuId = this.props.cuId
	//TODO: Don't look, it is awful
	apservice = this.props.wdaggr
		.workspaceData.container
		.commData.appService;

	updateFn = this.props.updateTrigger;
	
	state: CGObjectData = {
		x: this.props.x,
		y: this.props.y,
		actualPosition: false,
		moveMode: false,
		cuReady: false,
		dataReady: false,
	}

	data: {
		bufferMap: WorkspaceBufferMap
		idx: string 
		selectedIdx: string 
	} = {
		bufferMap: this.props.wdaggr
			.workspaceData
			.bufferMap,
		idx: this.props.index,
		selectedIdx: this.props
			.selectedIdx
		
	}
	
	getWorkspaceOffsets(parent: ParentNode | null): [number, number] {

		if(parent) {
			const wparent = parent.parentNode as HTMLElement;
		
			if(wparent) {
				return [wparent.offsetLeft, wparent.offsetTop];
			}
		}
		return [0, 0];
		
	}

	onLineUpdate(offLeft: number, offTop: number) {
		//const xdiff = offLeft - this.state.x);
		this.updateFn(this.data.idx, {
			x: this.state.x - offLeft,
			y: this.state.y - offTop,
			depth: 0,
			parent: ''	
		});


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
			const parent = e.currentTarget.parentNode;
			
			const [oleft, otop] = this.getWorkspaceOffsets(parent);
			const nx = e.clientX;
			const ny = e.clientY;
			
			this.state.x = nx;
			this.state.y = ny;

			let nState = {...this.state};
			this.onLineUpdate(oleft, otop);
			this.setState(nState);
		}
	}

	onNodeMouseUp(e: React.MouseEvent<HTMLDivElement>) {

		const btn = e.button;
		if(btn === 1) {
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
			this.state.x = nx;
			this.state.y = ny;
			this.state.moveMode = true;
			this.state.actualPosition = true;
			
			let nState = {...this.state};
			const parent = e.currentTarget.parentNode;
			
			const [oleft, otop] = this.getWorkspaceOffsets(parent);
			this.onLineUpdate(oleft, otop);
			this.setState(nState);

		} else if(btn === 0) {
			if(this.props.cuReqData === null ||
			  this.props.cuReqData.status 
				!== 'complete') {
				this.apservice.sendObj('get_graph', {
					'gid': this.data.idx
				});
				//TODO THIS IS A FAKE PART
				this.state.cuReady = true;
				this.state.dataReady = true;
				//END OF FAKE PART
			}
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


	render() {
		const rottContainer = this.props.wdaggr.workspaceData.container;
		const zoomValue = rottContainer.state.appStateData.zoomValue;
		let widgetObj = this.props.wdaggr
			.graph.graph.get(
			this.props.index);
		const widget = widgetObj !== null ?
			widgetObj : RottCallGraphEntryDefault();
		
		let x = `${this.state.x-25}`;
		let y = `${this.state.y-25}`;
		let sObj = { left: `${x}px`,top: `${y}px`,
			position: 'fixed',
			minWidth: `${80*(zoomValue/100)}px`,
			maxWidth: `${80*(zoomValue/100)}px`,
		} as React.CSSProperties;
		if(!this.state.actualPosition) {

			x = `${this.state.x}%`;
			y = `${this.state.y}%`;
			sObj = {
				left: `calc(${x} - 25px)`,
				top: `${y}`,
				position: 'absolute',
				minWidth: `${80*(zoomValue/100)}px`,
				maxWidth: `${80*(zoomValue/100)}px`,

			} as React.CSSProperties

		}
		let description = 'Compiling';
		let cuId = 'X_X';
		let compName = 'Compiling';
		if(widget) {
			compName = widget.name;
			cuId = widget.id;
			if(widget.description) {
				description = widget.description;
			}
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
				onMouseMove={(e) => this
					.onNodeMove(e)}>
				<header 
					className={
						styles
						.widgetObjectHeader}>
					{cuId}
				</header>
				<div className={styles
					.widgetObjectBody}>
				{description}	
				</div>
				<div className={
						styles.cuStatus}>
					{compName}	
				</div>
			</div>
		);
	}

}

type CGLinePositionData = {
	x1: number
	x2: number
	y1: number
	y2: number
	pairUnit1: string
	pairUnit2: string

}



type CGObjectLineData = {
	idx: string
	updateable: CGUpdatable
	pairUnit1: string 
	pairUnit2: string 
	x1: number
	x2: number
	y1: number
	y2: number
}

type CGObjectLineUpdatable = {
	updateable: CGUpdatable
	pairUnit1: string 
	pairUnit2: string 
	x1: number
	x2: number
	y1: number
	y2: number
}

export class CGObjectLine extends React.Component<CGObjectLineData, CGObjectLineUpdatable> 
	implements CGUpdateableContext {

	constructor(props: CGObjectLineData) {
		super(props);
		
		props.updateable.registerContext(this);
	}
		
	state: CGObjectLineUpdatable = {
		updateable: this.props.updateable,
		x1: this.props.x1, 
		x2: this.props.x2,
		y1: this.props.y1,
		y2: this.props.y2,
		pairUnit1: this.props.pairUnit1,
		pairUnit2: this.props.pairUnit2
	};

	getCoords() {
		return this.state;
	}

	pushPositionUpdate(pdata: CGLinePositionData) {
		const nState = {...this.state};
		nState.x1 = pdata.x1;
		nState.x2 = pdata.x2;
		nState.y1 = pdata.y1;
		nState.y2 = pdata.y2;
		nState.pairUnit1 = pdata.pairUnit1;
		nState.pairUnit2 = pdata.pairUnit2;
		this.setState(nState);

	}

	render() {
		//this.state.updateable.registerContext(this);
		const { idx } = this.props;
		const { x1, x2, y1, y2, pairUnit1, pairUnit2 } = this.state;
		let styPropUpdate: CSSProperties = {};
		if(this.state.pairUnit1 !== '%' || this.state.pairUnit2 !== '%') {
			styPropUpdate = { position: 'absolute' } as CSSProperties;
		}

		return (
			 <line style={styPropUpdate}
			 	key={`cu${idx}`} 
				x1={`${x1}${pairUnit1}`} 
				x2={`${x2}${pairUnit2}`} 
				y1={`${y1+5}${pairUnit1}`} 
				y2={`${y2+5}${pairUnit2}`} stroke={'white'} 
					strokeWidth={'1'}
			/>		)
	}
}


export class CallGraphSpace extends 
	React.Component<WorkspaceData, CGViewState> 
	implements ASContextHook {
	
	appService = this.props.container.commData.appService;	
	state: CGViewState = {
		cunitMap: new Map(),
		dispPositions: new Map(),
		srcPositions: new Map(),
		destPositions: new Map(),
		refresh: true,
	}

	resetState() {
		this.state.cunitMap = new Map();
		this.state.dispPositions = new Map();
		this.state.srcPositions = new Map();
		this.state.destPositions = new Map();

	}
	

	constructor(props: any) {
		super(props);
		const container = this.props.container;
		const aService = container.commData.appService;
		aService.hookContext(this,'status_response');
		aService.hookContext(this,'get_graph');
		aService.hookContext(this,'get_root_graph');
	}
	
	serviceHook(asm: AppServiceMessage): void {
		const cgspace = this;	
		const container = this.props.container;
		const appService = container.commData.appService;

		const jsonObj = asm.getJSON()
		//Your response here
		//Turn it into a CUReqResult
		if(jsonObj) {
			if(jsonObj.message === 'status_response') {
				const containerMsg 
				= new RottStatusResponseMSG();
				const rData = asm
					.parseDataTo(containerMsg)
				if(rData) {
					const cuData = rData
						.curesult;
					this.state.cunitMap	
						.set(cuData.cu_id,
						     cuData);
					this.props.bufferMap
					.insert('node_column',
						JSON
						.stringify(cuData));
						const nState 
						= {...this.state}
					this.setState(nState);
				}
			} else if(jsonObj.message === 'get_graph') {
				//let gid = jsonObj.gid;
				let graph = appService
					.decodeGraph(asm);
				if(graph) {
					container.state.graphViewData
					= graph;
				}
				this.props.bufferMap
					.insert('node_column',
						JSON
						.stringify(0));
				//TODO:
				// Reset the call_graph
				// and update
				cgspace.resetState();
				const nState = {...cgspace.state}
				nState.refresh = true;
				cgspace.setState(nState);

			} else if(jsonObj.message === 'get_root_graph') {
				let graph = appService
					.decodeGraph(asm);
				if(graph) {
					container.state.graphViewData
					= graph;
				}
				cgspace.resetState();
				const nState = {...cgspace.state}
				nState.refresh = true;
				cgspace.setState(nState);
			}
		}
	}

	traverseGraph(graph: RottCallGraph, 
		      rootIdx: string)
		: CGTreeDisplayData {

		const collection = graph.graph;
		//depth, parentIdx, entryIdx	
		let queue: Array<[number, string, string]> 
			=[[0,'', rootIdx]];
		let seenList: Set<string> = new Set();
		let traversalData: Array<CGTreeLayerData> = [];
		let current: [number, string, string] 
			| undefined = undefined;

		while(queue.length > 0) {
			current = queue.shift();
			if(!current) { continue; }
			
			const [depth, parentIdx, idx] = current;
			const currentCG = collection.get(idx);
			
			if(currentCG === undefined) {
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
					}
				);
			} else {
				traversalData[depth]
				.layerElements.push(element);	
			}
			

			//add children
			for(let i = 0; i < currentCG
			    .children.length; i++) {
				const childIdx = currentCG
					.children[i];
				if(!seenList.has(childIdx)) {
					seenList.add(childIdx);
					queue.push([depth+1, idx, 
						   childIdx]);
				}
			}
		}

		return {
			layerData: traversalData	
		}
	}
	
	identifyRoots(graph: RottCallGraph): Array<[string, 
			      RottGraphEntry]> {
		
		let rootList: Array<[string, RottGraphEntry]> = [];
		let seenSet: Set<string> = new Set();
		for(const [_, cgobj] of graph.graph.entries()) {
			for(const ck of cgobj.children) {
				seenSet.add(ck);
			}
		}

		
		for(const [k, cgobj] of graph.graph.entries()) {
			if(!seenSet.has(k)) {
				rootList.push([k, cgobj]);
			}
		}

		return rootList;
	}

	updateLinePosition(idx: string, data: CGPositionData) {
		const srcObjs = this.state.srcPositions.get(idx);
		const destObjs = this.state.destPositions.get(idx);
		if(srcObjs) {
			let x2 = data.x;
			let y2 = data.y;
			let pairUnit1 = '%';
			


			
			for(const [sk, co] of srcObjs) {
				
				const coords = co.getCoords();
				let nPosition: CGLinePositionData = {
					x1: 0,
					y1: 0,
					x2,
					y2,
					pairUnit1,
					pairUnit2: 'px'

				};
				if(idx === sk) {
					nPosition.pairUnit1 = 'px';

					nPosition.x1 = x2;
					nPosition.y1 = y2;
				} else {

					nPosition.pairUnit1 = coords.pairUnit1;
					nPosition.x1 = coords.x1;
					
					nPosition.y1 = coords.y1;
					
				}
				co.pushPositionUpdate(nPosition);

			}

		}
		if(destObjs) {
			let x1 = data.x;
			let y1 = data.y;
			let pairUnit2 = '%';
			for(const [dk, co] of destObjs) {
				
				const coords = co.getCoords();
				let nPosition: CGLinePositionData = {
					x1,
					y1,
					x2: 0,
					y2: 0,
					pairUnit1: 'px',
					pairUnit2

				};


				if(idx === dk) {
					nPosition.pairUnit2 = 'px';
					nPosition.x2 = x1;
					nPosition.y2 = y1;
				} else {
					nPosition.pairUnit2 = coords.pairUnit2;
					nPosition.x2 = coords.x2;
					nPosition.y2 = coords.y2;
				}
				
				co.pushPositionUpdate(nPosition);
			}
		}	
	}

	render() {
		
		let calcdHeight = 0;
		const zoomValue = this.props.container.state.appStateData.zoomValue;
		const cgref = this;
		const bmap = this.props.bufferMap;
		//TODO: We need to retrieve the graph information
		//	and update the details
		const graphFromContainer = this.props.container
			.getCGGraph();
		bmap.stash('graph_ref', graphFromContainer);
		const waggr: CGAggr = {
			graph: graphFromContainer,
			workspaceData: this.props
		}
		const rootList = this.identifyRoots(
			graphFromContainer)

		if(rootList.length !== 0) {
			
			let selectedIndex = rootList[0][0];	
			const selectedData = JSON.parse(
				bmap.get('root_node'));
			if(selectedData !== null) {
				//First index is the key
				selectedIndex = selectedData[0];
			}
				
			const upTrigger = (idx: string, data: CGPositionData) => {
				cgref.updateLinePosition(idx, data);
			};

			let cidx = 0;
			let prix = '';
			const rootN = rootList.length;
			const renderedCGs = 
				rootList.map((e) => {

					return this.traverseGraph(
					graphFromContainer, e[0]) })
				.map((ldw: CGTreeDisplayData) => { 
						
					return ldw.layerData
				.map((wl: CGTreeLayerData, lidx: number) => {
					const wlLength 
						= wl.layerElements.length;
					calcdHeight += 20;
					cidx += 1;
					const wlRes = 
						wl.layerElements
					.map((w: CGLayerEntry, 
					      idx: number) => {

						const wname = waggr
						.graph
						.graph
						.get(w.entryIdx)
							?.cu_id;
						let yoff = 0;
						let sidx = idx+1;
						let xdiff = 100/(wlLength*2);
						if(lidx === 0) {
							xdiff = 100/(rootN*2);
							sidx = cidx+1;

							if(xdiff < 0.1) {
								if(sidx % 2 === 1) {
									xdiff = 1;
									yoff = (Math.random()
										* 0.1);	
								} else {
									xdiff = 0.5 
									+ (Math.random() * 2);
								}
							}
						}
						
						let xperc = xdiff * (sidx);
						let xdisp = (xperc * (idx +1)) + 
							(xperc * idx);
						if(xdisp > 100 && lidx === 0) {
							const rowOff = Math.floor(xdisp) % 100;
							//yoff = rowOff * 1.5 ;
							
							xdisp = rowOff;				
						}


						const cuVal = this.state
							.cunitMap.get(wname !== undefined ? wname
								: '');
						const distCU = cuVal !== null 
						&& cuVal !== undefined ?
							cuVal : null;

						const wdispData : CGDispData = {
							wdaggr: waggr,
							index: w.entryIdx,
							x: xdisp,
							y: yoff,
							selectedIdx: selectedIndex,
							cuReqData: distCU,
							cuId: wname === undefined 
								? '' :
								wname,
							updateTrigger: upTrigger

						};

						const pIdx = prix;
						const pDepth = wl.depth+1;
						
						if( w.entryIdx) {	
							this.state.dispPositions.set(
								w.entryIdx,
								{
									x: wdispData.x,
									y: wdispData.y,
									depth: pDepth,
									parent: pIdx
								}
							);
						}
						prix = w.entryIdx;
						if(!cgref.state.srcPositions.has(w.entryIdx)) {
							cgref.state.srcPositions.set(
								w.entryIdx,
								new Map()
							);
						}
						if(!cgref.state.destPositions.has(w.entryIdx)) {
							cgref.state.destPositions.set(
								w.entryIdx,
								new Map()
							);
						}
						return (<CGObject key={`cgobj_${wname}`}
							{...wdispData}/>)
					});

					//prevWlen = wlLength; 
					calcdHeight += 25;

					return wlRes;
				})
			});
			
							//Construct svg with lines
			const svgLines = this.state.dispPositions.entries().map((e, _) => {
				const [k, coords] = e;
				//const [x1, y1, _d, pname] = coords;
				const x1 = coords.x;
				const y1 = coords.y;
				let pname = coords.parent;

				const p = this.state.dispPositions.get(pname)
				let x2 = x1;
				let y2 = y1;
				if(p) {
					x2 = p.x;
					y2 = p.y;

				
				} else {
					pname = k;
				}
				const tFresh = this.state.refresh;
				let updatableRef: CGUpdatable = new UpdatableLineRef();
				const upSrcCol = this.state.srcPositions.get(pname);
				const upDestCol = this.state.destPositions.get(k);
				let upRefChk = null;
				if(upSrcCol && !tFresh) {
					upRefChk = upSrcCol.get(k);

					if(upRefChk) {
						updatableRef = upRefChk;
					}
				} 
				if(upDestCol && tFresh) {

					upRefChk = upDestCol.get(k);
					if(upRefChk) {
						updatableRef = upRefChk;
					}
				}
				
				const cgobjdata: CGObjectLineData = {
					idx: k,
					x1,
					x2,
					y1,
					y2,
					pairUnit1: '%',
					pairUnit2: '%',
					updateable: updatableRef
				};

				const cgobjRen = <CGObjectLine key={`cgobj_l${k}`} 
					{...cgobjdata} />;
				//TODO: Revisit in case
				//updatableRef.registerContext(cgobjRen);
				let srcCol = this.state.srcPositions.get(pname);
				let destCol = this.state.destPositions.get(k);
				if(srcCol) {
					srcCol.set(k, updatableRef);
				}
				if(destCol) {
					destCol.set(pname, updatableRef);
				}

				return cgobjRen;
			}).toArray();
			this.state.refresh = false;
				/*return (
					<div className={styles.widgetSpace}
					style={{height: `${calcdHeight}%`, width:`${zoomValue}%`,
						fontSize: `${(11*(zoomValue/100))}pt`,
						}}>
					
					
						{renderedCGs}
						<svg key={`svg_group`} className={styles
							.widgetSVGLineStack}>
							{svgLines}	
						</svg>
					</div>
					)*/
					//const data = genData(10);
					//TODO: Update this part with real data
					const data = PreMadeData;
					return (
						<CGChartSpace graphData={data}
							workspaceData={cgref.props}
							selKey={'T_IDLE_VOLUME'}
						/> 
					);
				} else {
						const requestGraph = () => {
					cgref.props.bufferMap
						.insert('reset_rlist',
						JSON.stringify({ reset: true }));

					const aps = cgref.appService;
					cgref.resetState();
					aps.sendObj('get_root_graph', JSON.stringify(
						{ gid: 0 }
					));
				}


				return (
					<div className={styles.widgetSpace}
					style={{height: `${calcdHeight}%`}}>
						<div className={styles.badGraph}>
						Unable to load call-graph
						<div><button className={styles.retryButton}
							onClick={(_) => requestGraph()}>
						Retry
						</button></div>
						</div>	
					</div>

				)
			}
	
		}
	}
