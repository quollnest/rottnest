import React from "react";
import {WorkspaceData} from "../workspace/Workspace";
import styles from '../styles/CGSpace.module.css'
import {WorkspaceBufferMap} from "../workspace/WorkspaceBufferMap";
import {CUReqResult,
	RottCallGraph,
	RottCallGraphDefault,
	RottCallGraphEntryDefault,
	RottGraphEntry} from "../../model/CallGraph";
import {ASContextHook} from "../../net/AppService";
import {AppServiceMessage} from "../../net/AppServiceMessage";
import {RottStatusResponseMSG} from "../../net/Messages";



type CGPositionData = {
	x: number
	y: number
}

type CGViewState = { 
	positionMap: Map<string, CGPositionData> 
	cunitMap: Map<string, CUReqResult>
}

type LineStackEntry = {
	x1: number
	x2: number
	y1: number
	y2: number
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
		let widgetObj = this.props.wdaggr
			.graph.graph.get(
			this.props.index);
		const widget = widgetObj !== null ?
			widgetObj : RottCallGraphEntryDefault();
		
		let x = `${this.state.x-25}`;
		let y = `${this.state.y-25}`;
		let sObj = { left: `${x}px`,top: `${y}px`,
			position: 'fixed' 
		} as React.CSSProperties;
		if(!this.state.actualPosition) {

			x = `${this.state.x}%`;
			y = `${this.state.y}%`;
			sObj = {
				left: `calc(${x} - 25px)`,
				top: `${y}`,
				position: 'absolute' 
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



export class CallGraphSpace extends 
	React.Component<WorkspaceData, CGViewState> 
	implements ASContextHook {
	
	state = {	
		cunitMap: new Map(),
		positionMap: new Map(),
	}

	resetState() {
		this.state.cunitMap = new Map();
		this.state.positionMap = new Map();

	}

	constructor(props: any) {
		super(props);
		const container = this.props.container;
		const aService = container.commData.appService;
		aService.hookContext(this,'status_response');
		aService.hookContext(this,'get_graph');
	}
	
	serviceHook(asm: AppServiceMessage): void {
		const cgspace = this;	
		const container = this.props.container;
		const appService = container.commData.appService;

		const jsonObj = asm.getJSON()
		//Your response here
		//Turn it into a CUReqResult
		console.log(jsonObj);
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
				console.log(graph);
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
			.getCGGraph();
		bmap.stash('graph_ref', graphFromContainer);
		const waggr: CGAggr = {
			graph: graphFromContainer,
			workspaceData: this.props
		}
		const rootList = this.identifyRoots(
			graphFromContainer)
		let selectedIndex = rootList[0][0];	
		const selectedData = JSON.parse(
			bmap.get('root_node'));
		if(selectedData !== null) {
			//First index is the key
			selectedIndex = selectedData[0];
		}
	
	       	//let prevWlen = 100;
		let dispPositions: Map<string, [number, 
			number, number, string]> 
			= new Map();


		//let lineStack: Array<LineStackEntry> = [];

		const renderedCGs = 
		rootList.map((e) => {
				return this.traverseGraph(
				graphFromContainer, e[0]) })
			.map((ldw: CGTreeDisplayData) => { 
				return ldw.layerData
			.map((wl: CGTreeLayerData) => {
				const wlLength 
					= wl.layerElements.length;
				calcdHeight += 20;
				const wlRes = 
					wl.layerElements
				.map((w: CGLayerEntry, 
				      idx: number) => {

					const wname = waggr
					.graph
					.graph
					.get(w.entryIdx)
						?.cu_id
					
				const xperc = (100 / (wlLength*2));
				const xdisp = (xperc * (idx +1)) + 
					(xperc * idx);

				const cuVal = this.state
					.cunitMap.get(wname);
				const distCU = cuVal !== null 
				&& cuVal !== undefined ?
					cuVal : null;

				const wdispData : CGDispData = {
					wdaggr: waggr,
					index: w.entryIdx,
					x: xdisp,
					y: wl.depth * 20,
					selectedIdx: selectedIndex,
					cuReqData: distCU,
					cuId: wname === undefined 
						? '' :
						wname,
				};

				//Compute line between child and parent
				//We need to know if the parent 
				//is starting or not
				

					const pIdx = w.parentIdx;
					const pDepth = wl.depth-1;
					if(wname) {	
						dispPositions.set(
							wname,
							[wdispData.x,
							wdispData.y,
							pDepth,
							pIdx]
						);
					}

				

					return (
						<CGObject key={wname}
						{...wdispData}/>
					);
				});

				//prevWlen = wlLength; 
				calcdHeight += 25;

				return wlRes;
			})
		});

		//Construct svg with lines
		/*const svgLines = lineStack.map((l, idx) => {
			return <line key={`cu${idx}`} 
				x1={`${l.x1}%`} 
				x2={`${l.x2}%`} 
				y1={`${l.y1}%`} 
				y2={`${l.y2+2}%`} stroke={'white'} 
					strokeWidth={'1'}
			/>
		});*/

		return (
			<div className={styles.widgetSpace}
			style={{height: `${calcdHeight}%`}}>
				{renderedCGs}
				<svg className={styles
					.widgetSVGLineStack}>
					
				</svg>
			</div>
		)
	}
	}


