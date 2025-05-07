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

import {CGResult, CGResultDummy, CUReqResult, CUReqResultDummy, CUVolumeDummy} 
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
	rootList: Set<string>
}


type CGNodeData = {
	cuReqData: CUReqResult
	workspaceData: WorkspaceData 
	nodeData: NodeData | null
}

class CGSelectedNodeBox extends React.Component<CGNodeData, 
	{}>  {

	cuId: string = 'test';

	actionOnNode(data: any,
		    runReady: boolean, simReady: boolean) {
		if(simReady) {
			this.gotoVisualiserWithData(data);
		} else if(runReady) {
			this.runGraphNode(data);
		}
	}

	runGraphNode(data: any) {
		const container = this.props.workspaceData.container;
		
		const appService = container.commData.appService;
		appService.sendObj('cg_lat2d_run_graph_node', {
				gid: data.idx
			})
	}

	gotoVisualiserWithData(data: any) {
		console.log("Going to visualiser");
		const bmap = this.props.workspaceData.bufferMap;
		const bmapViz = JSON.parse(bmap.get('viz_sim_data'));
		let simReady = false;
		if(bmapViz) {
			simReady = bmapViz.simready;
		}

		if(simReady) {
			//Grab data here?
			const vizData = this.props.workspaceData.container.state.visData;
			bmap.insert('current_viz_data', JSON.stringify(vizData)); 
			this.props.workspaceData.container
			.gotoVizWithData(data);
		}
	}

	getGlobalVolumes(): CGResult {
		const rrbuf = this.props.workspaceData.container.getRRBuffer();

		const gvolumes = rrbuf.getTotalArray();
		if(gvolumes.length > 0) {
			const lastVol = gvolumes[gvolumes.length-1];

			return lastVol;
		} else {
			return CGResultDummy();
		}
	}

	getCompilationFinished(): string {
		const rrbuf = this.props.workspaceData.container.getRRBuffer();

		const gendcomp = rrbuf.getEndComp();
		if(gendcomp.length > 0) {
			return 'Compilation Finished';
		} else {
			return 'Compiling';
		}
	}

	render() {
		const ndata = this.props;	
		//const cuObj = this.props.cuReqData;
		const bmap = this.props.workspaceData.bufferMap;	
		/*let tsourceInfo = { 
			contents: false,
			info: 'No Info',
			mappedData: new Map()
		};*/
		let cuResults = this.getGlobalVolumes();
		let cuVolume = cuResults.volumes;
		let cuTocks = cuResults.tocks;
	        let tsourceInfo = cuResults.tSource;
		let cuDetailsReady = false;
		let nName = 'Not selected';
		let nDescription = '';
		let nKind = 'NoKind';
		let compStr = this.getCompilationFinished();
		if(ndata.nodeData !== null 
		   && ndata.nodeData !== undefined) {
			const nd = ndata.nodeData;
			nKind = nd.kind;
			nName = nd.idx;
		}
		let tdata = [];		
	
	        if(tsourceInfo) {
			for(const k in tsourceInfo) {
				const tdat = tsourceInfo[k];
				tdata.push(
					<div key={`tdat_${k}`}>
					{k}:{tdat}	
					</div>
				);
			}
		}
		const bmapViz = JSON.parse(bmap.get('viz_sim_data'));
		let simReady = false;
		let runReady = false;
		let runReqd = false;
		let runFnd = false;
		if(bmapViz) {
			simReady = bmapViz.simready;
			runReady = bmapViz.runready;
			runReqd = bmapViz.runrequested;
			runFnd = bmapViz.runfinished;
		}
		let visText = runReady ? 'Run Node' : 'Not Available';
		visText = runReqd ? 'Currently Running' : visText;
		visText = runFnd ? 'Run Visualisation' : visText;
		visText = simReady ? 'Run Visualisation' :
			visText;	

		const vzReadyStyle = simReady || runReady ? '' : styles.vizNotReady;
		const compInfo = (<div className={styles.dataSegment}>
				  <header>Compilation State:</header>
					<span>
					{compStr}
					</span>

			</div>)
		const tDisp = tdata === null ? 
			<></>:
			<div className={styles.dataSegment}>
				<header>Last Run - T Source Info:</header>
				{tdata}
			</div>
		const tockDisp = cuTocks === null ? 
			<></>:
			<div className={styles.dataSegment}>
				<header>Last Run - Tocks Info:</header>
				<div>
					<span>
					Graph-State
					</span>
					<span>: </span>
					<span>
					{cuTocks.graph_state}
					</span>
				</div>
				<div>
					<span>
					Bell Input 
					</span>
					<span>: </span>
					<span>
					{cuTocks.bell}
					</span>
				</div>
				<div>
					<span>
					T-Schedule
					</span>
					<span>: </span>
					<span>
					{cuTocks.t_schedule}
					</span>
				</div>
				<div>
					<span>
					Bell Output
					</span>
					<span>: </span>
					<span>
					{cuTocks.bell2}
					</span>
				</div>
				<div>
					<span>
					Total 
					</span>
					<span>: </span>
					<span>
					{cuTocks.total}
					</span>
				</div>
			</div>
		const renResult = !cuDetailsReady ? 
			(<div className={styles.nodePanel}>
			 	<header>
				<div>Id: {nName}</div> 
				<div>Type: {nKind}</div>
				</header>
				<div>
				{nDescription}
				</div>
				<div className={styles
					.dataSegment}>
					<header>
					Global Volumes:
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
					<div><span>Bell-Rout.Vol: </span>
					<span>{cuVolume
						.BELL_ROUTING_VOLUME}
					</span></div>
					<div><span>Bell-Idle.Vol: </span>
					<span>{cuVolume
						.BELL_IDLE_VOLUME}
					</span></div>
					<div><span>Non-Part.Vol: </span>
					<span>{cuVolume
						.NP_VOLUME}
					</span></div>
				</div>
				{compInfo}
				{tDisp}
				{tockDisp}
				<div>
					<button className={`${styles
						.vizButton} ${vzReadyStyle}`}
						onClick={(_) => {
						this.actionOnNode(ndata.nodeData,
								 runReady, simReady)}}>
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
					Context & Volumes	
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
	refreshCol: (set: Set<string>) => void
	
}

class RootListItem 
	extends React.Component<RootListItemData, {}> {
	
	rlist: Set<string> = this.props.rootList;
	listPositon = this.props.idxTup.listPosition;
	rootIdx = this.props.idxTup.rootIdx;
	bufferMap = this.props.bufferMap;
	selected = this.props.selected;
	container = this.props.container;
	refresh = this.props.refreshCol;

	updateRootNode() {
		const aps = this.container.commData.appService;
		if(this.rootIdx === 'root') {
			this.rlist = new Set(['root']);	
			aps.sendObj('cg_lat2d_get_root_graph', {});
			let nnode = {
				idx: this.rootIdx
			};
			const nstr = JSON.stringify(nnode);

			this.bufferMap
				.insert('root_node',nstr);
			this.bufferMap
				.insert('reset_rlist',JSON.stringify({ reset: true }));
			this.bufferMap.commit();
		} else {
			const nSet: Set<string> = new Set();
			let foundRoot = false;
			this.rlist.values().forEach((e) => {
				if(e === this.props.idxTup.rootIdx) {
					nSet.add(e);
					foundRoot = true;
				}
				else {
					if(!foundRoot) {
						nSet.add(e);
					}
				}
			});
			let nnode = {
				idx: this.rootIdx
			};
			const nstr = JSON.stringify(nnode);

			this.bufferMap
				.insert('root_node',nstr);
			aps.sendObj('cg_lat2d_get_graph',  {gid: this.rootIdx });
			//this.refresh(nSet);
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
	extends React.Component<CGRootData, { rootList: Set<string> }> {
	
	state: { rootList: Set<string> } = { rootList: this.props.rootList };

	render() {
		//if(this.state.rootList.size < this.props.rootList.size) {
			this.state.rootList = this.props.rootList;
		//}
		const bmap = this.props.bufferMap;
		const rlist = this.state.rootList; 
		const selectedIdx = this.props.selectedIdx;
		const container = this.props.container;
		const selfRef = this;
		const refreshColumn = (set: Set<string>) => {
			console.log(set);
			selfRef.setState({ rootList: set });
			console.log("Did you run?");
		};
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
					refreshCol={refreshColumn}
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

	state: CGRootListContainer = {
		selectedIdx: '',
		bufferMap: this.props
			.workspaceData.bufferMap,
		rootList: new Set(['root'])
	}

	render() {
		
		const bufferMap = this.props
			.workspaceData.bufferMap
		//const graphRef = bufferMap.getStash()
		//	.get('graph_ref');
		
		
		let rootList = this.state.rootList;
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
				this.state.rootList = new Set(['root']);
				rootList = this.state.rootList;
				
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
