import React from "react";
import styles from '../styles/WidgetSpace.module.css'
import {Workspace, WorkspaceData} from "../workspace/Workspace";

import {
	RollbackOutlined,
	ArrowLeftOutlined
	} from '@ant-design/icons'
import {WorkspaceBufferMap} from "../workspace/WorkspaceBufferMap";


type NodeData = {
	idx: number
	kind: string
}

type WidgetNodeColumnData = {

	workspaceData: WorkspaceData 
}


type WidgetNodeData = {

	workspaceData: WorkspaceData 
	nodeData: NodeData | null
}

class WidgetSelectedNodeBox extends React.Component<WidgetNodeData, 
	{}>  {


	render() {
		const ndata = this.props;
		let innerContents = <span>Unselected</span>
		if(ndata.nodeData !== null 
		   && ndata.nodeData !== undefined) {
			const nd = ndata.nodeData;
			innerContents = (
				<div>
				<div>Index: {nd.idx}</div>
				<div>Kind: {nd.kind}</div>
				</div>

			)
		}

		return (
			<div className={styles.widgetBoxContent}>
				{innerContents}	
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
