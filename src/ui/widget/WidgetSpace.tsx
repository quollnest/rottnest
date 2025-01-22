import React from "react";
import {WorkspaceData} from "../workspace/Workspace";
import RottnestContainer from "../container/RottnestContainer";
import styles from '../styles/WidgetSpace.module.css'
import {WorkspaceBufferMap} from "../workspace/WorkspaceBufferMap";

type WidgetViewState = { data: any }

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
//	largestRowIdx: number
//	largestRowChildren: number
	layerData: Array<WidgetTreeLayerData>
}


/**
 * We will assume that the data is a flat structure
 * with index links
 * I have opened it up to have fieldData that will
 * allow mapping for it
 */
type WidgetData = {
	name: string
	children: Array<number>
	description: string
	//fieldData: Map<string, string>
}

/**
 * This will be aggregation of all the widget data,
 * we will have a selected index that allows the
 * component to select it and represent it
 *
 */
type WidgetAggr = {
	collection: Array<WidgetData>
	selectedIndex: number
	workspaceData: WorkspaceData
}

type WidgetDispData = {
	wdaggr: WidgetAggr
	index: number
	selectedIdx: number
	x: number
	y: number
}

/**
 * WidgetObject, 
 */
class WidgetObject extends React.Component<WidgetDispData, {}> {

	data: {
		bufferMap: WorkspaceBufferMap
		idx: number
		selectedIdx: number
	} = {
		bufferMap: this.props.wdaggr
			.workspaceData.bufferMap,
		idx: this.props.index,
		selectedIdx: this.props.selectedIdx
		
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
	

	
	onNodeClick() {
		if(this.data.idx !== this.data.selectedIdx) {
			let nnode = {
				idx: this.data.idx
			};
			const nstr = JSON.stringify(nnode);
			this.data.bufferMap
				.insert('root_node',nstr);	
			this.data.bufferMap
				.insert('next_node',nstr);	
			this.data.bufferMap.commit();
		}
	}


	render() {


			
		const index = this.props
			.index;
		const widget = this.props.wdaggr
			.collection[index];
		const x = this.props.x;
		const y = this.props.y;
		return (
			<div style={{marginLeft: 
				`calc(${x}% - 25px)`,top: `${y}%`}}
				className={styles.widgetObject}
				onMouseEnter={(_) => { 
					this.onHoverTrigger()}}
				onClick={(_) => {
					this.onNodeClick()
				}}
					>
					
				<header 
					className={
						styles
						.widgetObjectHeader}>
					{widget.name}
				</header>
				<div className={styles
					.widgetObjectBody}>
				{widget.description}
				</div>
			</div>
		);
	}

}



export class WidgetSpace extends 
	React.Component<WorkspaceData, WidgetViewState> {

	//This is currently dummy data
	widgetData: { 
		collection: Array<WidgetData>
		selectedIndex: number
	} = {
		collection: [
			{
				name: 'comp1',
				description: 'comp1 desc',
				children: [1, 2, 3]
			},
			{
				name: 'comp2',
				description: 'desc',
				children: [4]
			},

			{
				name: 'comp3',
				description: 'desc',
				children: [5]
			},
			{
				name: 'comp4',
				description: 'desc',
				children: []
			},
			{
				name: 'comp5',
				description: 'desc',
				children: [6, 7]
			},
			{
				name: 'comp6',
				description: 'desc',
				children: []
			},
			{
				name: 'comp7',
				description: 'desc',
				children: []
			},
			{
				name: 'comp8',
				description: 'desc',
				children: [8]
			},
			{
				name: 'comp9',
				description: 'desc',
				children: []
			},


		],
		selectedIndex: 0
	}



	traverseGraph(collection: Array<WidgetData>, 
		      rootIdx: number)
		: WidgetTreeDisplayData {
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
			const currentWidget = collection[idx];
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

		const waggr: WidgetAggr = {
			collection: this.widgetData.collection,
			selectedIndex: this.widgetData.selectedIndex,
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
			this.widgetData.collection, selectedIndex
		).layerData
		.map((wl: WidgetTreeLayerData, _: number) => {
			

			const wlLength = wl.layerElements.length;
			calcdHeight += 20;
			const wlRes = wl.layerElements
			.map((w: WidgetLayerEntry, idx: number) => {
				const wname = waggr
					.collection[w.entryIdx].name
				const xperc = (100 / (wlLength*2));
				const xdisp = (xperc * (idx +1)) + 
					(xperc * idx);
				const wdispData = {
					wdaggr: waggr,
					index: w.entryIdx,
					x: xdisp,
					y: wl.depth * 20,
					selectedIdx: selectedIndex
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
		const svgLines = lineStack.map((l, _) => {
			return <line 
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

