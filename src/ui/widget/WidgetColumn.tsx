import React from "react";
import styles from '../styles/WidgetSpace.module.css'
import {Workspace, WorkspaceData} from "../workspace/Workspace";

import {
	RollbackOutlined,
	ArrowLeftOutlined
	} from '@ant-design/icons'
import {WorkspaceBufferMap} from "../workspace/WorkspaceBufferMap";
import {CUReqResult, CUReqResultDummy, CUVolumeDummy} from "../../model/WidgetGraph";


type NodeData = {
	idx: number
	kind: string
}

type WidgetNodeColumnData = {
	workspaceData: WorkspaceData 
}


type WidgetNodeData = {
	cuReqData: CUReqResult
	workspaceData: WorkspaceData 
	nodeData: NodeData | null
}

class WidgetSelectedNodeBox extends React.Component<WidgetNodeData, 
	{}>  {

	cuId: string = 'test';

	gotoVisualiserWithData(data: any) {
		console.log("Going to visualiser");
		this.props.workspaceData.container.gotoVizWithData(data);
	}

	render() {



		const ndata = this.props;
		let innerContents = <span>Unselected</span>
		
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
			<div className={styles.dataSegment}>No Data Available</div> :
			<div>
				<header>T Source Info</header>
				{tdata}
			</div>

		const renResult = !cuDetailsReady ? 
			(<div>
			 	<header>
				{this.cuId}:{status}
				</header>
				<div>
				Test Description
				</div>
				<div className={styles.dataSegment}>
					<header>
					Volumes:
					</header>

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
				<div>
					<button className={styles.vizButton}
						onClick={(_) => {
							this.gotoVisualiserWithData(cuObj)}}>
						Run Visualisation</button>
				</div>
			 </div>)
			:
			(<div>
			 Data Not Ready
			 </div>);



		if(ndata.nodeData !== null 
		   && ndata.nodeData !== undefined) {
			const nd = ndata.nodeData;
			innerContents = (
				<div className={styles.dataSegment}>
				<div>Index: {nd.idx}</div>
				<div>Kind: {nd.kind}</div>
				</div>

			)
		}

		return (
			<div className={styles.widgetBoxContent}>
				{innerContents}
				{renResult}
			</div>
		)
	}
}

export class WidgetNodeColumn 
	extends React.Component<WidgetNodeColumnData, 
	{}> implements Workspace {
	render() {

		const wsData = this.props.workspaceData;
		const bmap = wsData.bufferMap;
		console.log(bmap);
		let sData = bmap.get('current_node');
		let idx = -1;
		if(sData !== null) {
			const objDez = JSON.parse(sData);
			idx = objDez.idx as number;
		}

		
		return (
			<div className={styles.widgetViewContainer}>
				<header className={styles
					.widgetContainerHeader}>
					Node	
				</header>
				<WidgetSelectedNodeBox 
					nodeData={{
						idx,
						kind: 'test'
					}}
					cuReqData={CUReqResultDummy()}
					workspaceData={
						{...wsData}
					}/>
			</div>
		)
	}
}

type WidgetGraphData = {
	workspaceData: WorkspaceData
}

type WidgetGraphInfo = {
	idx: number 
}


class WidgetGraphBox extends React.Component<WidgetGraphInfo,{}> {
	
	render() {
		const rootIdx = this.props.idx;

		const fmtdText = `Root Index: ${rootIdx}`;	
		
		return (
			<div className={styles.widgetGraphBox}>
				<span>{fmtdText}</span>
			</div>
		);
	}

}

type WidgetRootData = {
	rootList: Array<number>
	selectedIdx: number
	bufferMap: WorkspaceBufferMap
}

type RootListItemTup = { 
	rootIdx: number
	listPosition: number
}

type RootListItemData = {
	idxTup: RootListItemTup	
	rootList: Array<number>
	selected: boolean
	isFirst: boolean
	bufferMap: WorkspaceBufferMap
}

class RootListItem 
	extends React.Component<RootListItemData, {}> {
	
	rlist: Array<number> = this.props.rootList;
	listPositon = this.props.idxTup.listPosition;
	rootIdx = this.props.idxTup.rootIdx;
	bufferMap = this.props.bufferMap;
	selected = this.props.selected;

	updateRootNode() {
		console.log("Called!", this.selected,
			   this.rootIdx, this.listPositon);
			let nnode = {
				idx: this.rootIdx
			};
			const nstr = JSON.stringify(nnode);
			this.bufferMap
				.insert('root_node',nstr);
			this.bufferMap.commit();
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

class WidgetRootList 
	extends React.Component<WidgetRootData, {}> {
		
	render() {
		const bmap = this.props.bufferMap;
		const rlist = this.props.rootList;
		const selectedIdx = this.props.selectedIdx;
		const renderedList = rlist.map((e, i) => {
			const tup: RootListItemTup = {
				rootIdx: e,
				listPosition: i,
			};
			const selected = e === selectedIdx
			return (
				<RootListItem 
					key={e}
					idxTup={tup} 
					rootList={rlist}
					selected={selected}
					isFirst={i === 0}
					bufferMap={bmap}
				/>
			)
		});

		return (
			<div>
				<header className={styles
					.rootListHeader}>
					Root List	
				</header>

				{renderedList}
			</div>
		);
	}

}

export class WidgetGraphColumn 
	extends React.Component<WidgetGraphData, WidgetRootData> {

	state: WidgetRootData = {
		rootList: [0],
		selectedIdx: 0
	}

	render() {
		
		const bufferMap = this.props
			.workspaceData.bufferMap
		const rootList = this.state.rootList;
		const dezData = JSON.parse(bufferMap
					   .get('root_node'));
		const nextData = JSON.parse(bufferMap
					    .get('next_node'));
		let idx = this.state.selectedIdx;
		if(dezData !== null) {
			idx = dezData.idx;
		}
		if(nextData !== null) {
			rootList.unshift(nextData.idx);
			bufferMap.insert('next_node', null);
		}

		return (
			
			<div className={styles.widgetViewContainer}>
				<header className={styles
					.widgetContainerHeader}>
					Graph
				</header>
				<WidgetGraphBox idx={idx} />
				<WidgetRootList 
					rootList={rootList}
					selectedIdx={idx}
					bufferMap={bufferMap}
				/>
			</div>)
		
	}
}	
