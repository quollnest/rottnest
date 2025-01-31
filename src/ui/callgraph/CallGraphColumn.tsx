import React from "react";
import styles from '../styles/CGSpace.module.css'
import {Workspace, WorkspaceData} 
	from "../workspace/Workspace";

import {
	RollbackOutlined,
	ArrowLeftOutlined
	} from '@ant-design/icons'

import {WorkspaceBufferMap} 
	from "../workspace/WorkspaceBufferMap";

import {CUReqResult, CUReqResultDummy, CUVolumeDummy} 
	from "../../model/CallGraph";
import RottnestContainer from "../container/RottnestContainer";


type NodeData = {
	idx: string 
	kind: string
}

type CGNodeColumnData = {
	workspaceData: WorkspaceData 
}


type CGRootListContainer = {
	selectedIdx: string
	bufferMap: WorkspaceBufferMap
}


type CGNodeData = {
	cuReqData: CUReqResult
	workspaceData: WorkspaceData 
	nodeData: NodeData | null
}

class CGSelectedNodeBox extends React.Component<CGNodeData, 
	{}>  {

	cuId: string = 'test';


	gotoVisualiserWithData(data: any) {
		console.log("Going to visualiser");
		const bmap = this.props.workspaceData.bufferMap;
		const bmapViz = JSON.parse(bmap.get('viz_sim_data'));
		let simReady = false;
		if(bmapViz) {
			simReady = bmapViz.simready;
		}

		if(simReady) {
			this.props.workspaceData.container
			.gotoVizWithData(data);
		}
	}

	render() {
		const ndata = this.props;	
		const cuObj = this.props.cuReqData;
		const bmap = this.props.workspaceData.bufferMap;	
		let tsourceInfo = { 
			contents: false,
			info: 'No Info',
			mappedData: new Map()
		};

		let cuVolume = CUVolumeDummy();
		let cuDetailsReady = false;
		let nName = 'Not selected';
		let nDescription = 'Compiling';
		let nKind = 'NoKind';
		if(ndata.nodeData !== null 
		   && ndata.nodeData !== undefined) {
			const nd = ndata.nodeData;
			nKind = nd.kind;
			nName = nd.idx;
		}
		if(cuObj !== null) {
			if(cuObj.status === 'complete') {
				cuDetailsReady = true;
				cuVolume = cuObj.volumes;
				tsourceInfo.contents =  true;
				tsourceInfo.info = 'Info';
				for(const tkey in cuObj.t_source) {
					tsourceInfo.mappedData
					.set(tkey,
					cuObj.t_source[tkey]);

				}
			} else if(cuObj.status === 'not_found') {

			} else if(cuObj.status === 'not_ready') {

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
		const bmapViz = JSON.parse(bmap.get('viz_sim_data'));
		let simReady = false;
		if(bmapViz) {
			simReady = bmapViz.simready;
		}
		const visText = simReady ? 'Run Visualisation' :
			'Not Ready';

		const vzReadyStyle = simReady ? '' : styles.vizNotReady;

		const tDisp = tdata === null ? 
			<div 
			className={styles.dataSegment}>
			No Data Available</div> :
			<div>
				<header>T Source Info</header>
				{tdata}
			</div>

		const renResult = !cuDetailsReady ? 
			(<div>
			 	<header>
				<div>{nName}</div> 
				<div>{nKind}</div>
				</header>
				<div>
				{nDescription}
				</div>
				<div className={styles
					.dataSegment}>
					<header>
					Volumes:
					</header>

					<div><span>Reg.Vol: </span>
					<span>{cuVolume
						.REGISTER_VOLUME}
					</span></div>
					<div><span>Fac.Vol: </span>
					<span>{cuVolume
						.FACTORY_VOLUME}
					</span></div>
					<div><span>Rout.Vol: </span>
					<span>{cuVolume
						.ROUTING_VOLUME}
					</span></div>
					<div><span>TIdle.Vol: </span>
					<span>{cuVolume
						.T_IDLE_VOLUME}
					</span></div>
				</div>
				{tDisp}
				<div>
					<button className={`${styles
						.vizButton} ${vzReadyStyle}`}
						onClick={(_) => {
					this
					.gotoVisualiserWithData(
						cuObj)}}>
					{visText}</button>
				</div>
			 </div>)
			:
			(<div>
			 Data Not Ready
			 </div>);	

		return (
			<div className={styles.widgetBoxContent}>
				{renResult}
			</div>
		)
	}
}

export class CGNodeColumn 
	extends React.Component<CGNodeColumnData, 
	{}> implements Workspace {
	render() {

		const wsData = this.props.workspaceData;
		const bmap = wsData.bufferMap;
		const graphRef = bmap.getStash().get('graph_ref');

		let sData = bmap.get('current_node');
		let idx = 'Not Selected';
		let cuReq = CUReqResultDummy();
		let kind = 'Not ready';
		if(sData !== null) {
			const objDez = JSON.parse(sData);
			idx = objDez.idx;
			if(graphRef) {
				let comp = graphRef.graph.get(idx);
				if(comp) {
					cuReq.cu_id = comp.cu_id;
					kind = comp.name;
				}
			}

		}

		
		return (
			<div className={styles.widgetViewContainer}>
				<header className={styles
					.widgetContainerHeader}>
					Node	
				</header>
				<CGSelectedNodeBox 
					nodeData={{
						idx,
						kind 
					}}
					cuReqData={cuReq}
					workspaceData={
						{...wsData}
					}/>
			</div>
		)
	}
}

type CGGraphData = {
	workspaceData: WorkspaceData
}

type CGGraphInfo = {
	idx: string 
}


class CGGraphBox extends React.Component<CGGraphInfo,{}> {
	
	render() {
		let rootIdx = this.props.idx;
		let fmtdText = `graph = ${rootIdx}`;	
		if(rootIdx === '') {
			rootIdx = 'call_graph';
			fmtdText = `overview: ${rootIdx}`;
		} 	
		return (
			<div className={styles.widgetGraphBox}>
				<div>Viewing:</div>
				<div>{fmtdText}</div>
			</div>
		);
	}

}

type CGRootData = {
	rootList: Set<string>
	selectedIdx: string
	bufferMap: WorkspaceBufferMap
	container: RottnestContainer
}

type RootListItemTup = { 
	rootIdx: string 
	listPosition: number
}

type RootListItemData = {
	idxTup: RootListItemTup
	container: RottnestContainer
	rootList: Set<string>
	selected: boolean
	isFirst: boolean
	bufferMap: WorkspaceBufferMap
	
}

class RootListItem 
	extends React.Component<RootListItemData, {}> {
	
	rlist: Set<string> = this.props.rootList;
	listPositon = this.props.idxTup.listPosition;
	rootIdx = this.props.idxTup.rootIdx;
	bufferMap = this.props.bufferMap;
	selected = this.props.selected;
	container = this.props.container;
	
	updateRootNode() {
		const aps = this.container.commData.appService;
		if(this.rootIdx === 'root') {
			this.rlist = new Set(['root']);	
			aps.sendObj('get_root_graph', {});

			let nnode = {
				idx: this.rootIdx
			};
			const nstr = JSON.stringify(nnode);

			this.bufferMap
				.insert('root_node',nstr);
			this.bufferMap
				.insert('reset_rlist',JSON.stringify({ reset: true }));
			this.bufferMap.commit();
		}
	}

	render() {
		const isFirst = this.props.isFirst;
		const isSelected = this.props.selected;
		const { rootIdx } = 
			this.props.idxTup;
		let styList = `${styles.rlistItem} `
		const backIcon = isFirst ?
			<ArrowLeftOutlined /> :
			<RollbackOutlined />;

		if(isSelected) {
			styList += `${styles.rlistItemSelected}`;
		}
			
		
		return (
			<div className={styList}
				onClick={(_) => {
					this.updateRootNode()
				}}>

				<span className={
					styles.rListItemText
				}>{rootIdx}</span>
				{backIcon}
			</div>	
		);
	}

}

class CGRootList 
	extends React.Component<CGRootData, {}> {
		
	render() {
		const bmap = this.props.bufferMap;
		const rlist = this.props.rootList;
		const selectedIdx = this.props.selectedIdx;
		const container = this.props.container;
		const dispList = rlist.entries().map((e, i) => {
			const tup: RootListItemTup = {
				rootIdx: e[0],
				listPosition: i,
			};
			const selected = e[0] === selectedIdx
			let obj = (<RootListItem
				   	container={container}
				   	key={e[0]}
					idxTup={tup} 
					rootList={rlist}
					selected={selected}
					isFirst={i === 0}
					bufferMap={bmap}
				/>
			);
			return obj;
		});
		let dcol = new Array(...dispList);
		return (
			<div>
				<header className={styles
					.rootListHeader}>
					Root List	
				</header>
				<div>
				{dcol}
				</div>
			</div>
		);
	}

}

export class CGGraphColumn 
	extends React.Component<CGGraphData, CGRootListContainer> {

	rootList: Set<string> = new Set(['root']);
	state: CGRootListContainer = {
		selectedIdx: '',
		bufferMap: this.props
			.workspaceData.bufferMap
	}

	render() {
		
		const bufferMap = this.props
			.workspaceData.bufferMap
		//const graphRef = bufferMap.getStash()
		//	.get('graph_ref');
		
		
		let rootList = this.rootList;
		const dezData = JSON.parse(bufferMap
					   .get('root_node'));
		const nextData = JSON.parse(bufferMap
					    .get('next_node'));
		const container = this.props
			.workspaceData.container;

		let idx = this.state.selectedIdx;

		if(dezData !== null) {
			idx = dezData.idx;
		}
		if(nextData !== null) {

			rootList.add(nextData.idx);
			bufferMap.insert('next_node', null);
		}
		const resetRList = JSON.parse(bufferMap.get('reset_rlist'));
		if(resetRList !== null) {
			if(resetRList.reset) {
				bufferMap.insert('reset_rlist', JSON.stringify({
					reset: false
				}));
				this.rootList = new Set(['root']);
				rootList = this.rootList;
				
			}
		}

		return (
			
			<div className={styles
				.widgetViewContainer}>
				<header className={styles
					.widgetContainerHeader}>
					Graph
				</header>
				<CGGraphBox idx={idx} />
				<CGRootList
					rootList={rootList}
					selectedIdx={idx}
					bufferMap={bufferMap}
					container={container}
				/>
			</div>)
		
	}
}	
