import React, {ReactElement, useRef, useState, useEffect} from "react";
import {CallGraphSpaceData, CGChartDimensions, CGSample, CUDataKey, DataAggregate, DataAggrMap, RunChartProps} from "./ChartData";
import {CallGraphStatsSpace} from "./CGChart";

import style from '../styles/CGChart.module.css';
import {WorkspaceData} from "../workspace/Workspace";
import {CUVolume} from "../../model/CallGraph";
/*const PreMadeData = [
	genData(20),
	genData(20),
	genData(20)
];*/

export function GenData(n: number): Array<CGSample> {
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
				BELL_IDLE_VOLUME: 6000 + (Math.random() * 1000),
				BELL_ROUTING_VOLUME: 5000 + (Math.random() * 1000),
				NON_PARTICIPATORY_VOLUME: 4000 + (Math.random()* 2000)
			}
		})
	}
	return data;
}

export class RunChartContainer extends React.Component<RunChartProps, {}>{
	render() {
		const props = this.props;	
		return (
			<RunChartSpace workspaceData={props.workspaceData} 
				selKey={"ALL"} />
		)
	}
}



const ResolveGraphData = (workspaceData: WorkspaceData): DataAggregate => {
		//graphData: Array<Array<CGSample>>
	/*
	0 REGISTER_VOLUME
	1 FACTORY_VOLUME
	2 ROUTING_VOLUME
	3 T_IDLE_VOLUME
	4 BELL_IDLE_VOLUME
	5 BELL_ROUTING_VOLUME
	6 NON_PARTICIPATORY_VOLUME
	 */
	const aggrData = [[],[],[],[],[],[]]
	const daggr: DataAggregate = {
		idxs: [],
		aggrMap: {
			REGISTER_VOLUME: aggrData[0],
			FACTORY_VOLUME: aggrData[1],
			ROUTING_VOLUME: aggrData[2],
			T_IDLE_VOLUME: aggrData[3],
			BELL_IDLE_VOLUME: aggrData[4],
			BELL_ROUTING_VOLUME: aggrData[5],
		},
		dataRefs: aggrData

	}

	
	const rrBuf = workspaceData.container.getRRBuffer();
	const cuidObjs = rrBuf.getVolumeSet();
	//TODO: Temporary, could likely do it directly but not wanting to play games
	//at the moment.
	for(const cmr of cuidObjs) {
		const cvol = cmr.volumes;
		daggr.idxs.push({
			mxid: cmr.mxid,
			cuid: cmr.cuID === undefined ? null : cmr.cuID,
			hash: cmr.cacheHash === undefined ? null : cmr.cacheHash.hashhex,
		});
		for(const ckey in cvol) {
			const cv = cvol[ckey as keyof CUVolume];
			const akey = ckey as keyof DataAggrMap;
			if(cv) {
				const dgrRef = daggr.aggrMap[akey]
				if(dgrRef) {
					dgrRef.push(cv);
				}
			}
		}
	}
	console.log(daggr);
	return daggr;
};

export const RunChartSpace = (props: CallGraphSpaceData): ReactElement => {
	
	const cgstatsSpace = useRef<any>();
	const [width, setWidth] = useState(600);
	const [height, setHeight] = useState(600);
	const [isReady, setReady] = useState(false);
	const selKey = props.selKey as CUDataKey;
	const graphData: DataAggregate = ResolveGraphData(props.workspaceData);
	const workspaceData = props.workspaceData;

	useEffect(() => {
		const rszObs = new ResizeObserver((event) => {
			setWidth(event[0].contentBoxSize[0].inlineSize);
			setHeight(event[0].contentBoxSize[0].blockSize * 0.65);
			setReady(true);		
		});
		rszObs.observe(cgstatsSpace.current);
	});

	const margins = {
		top: 50,
		bottom: 30,
		left: 70,
		right: 70
	};

	const dimensions: CGChartDimensions = {
		width,
		wUnit: 'px',
		height,
		hUnit: 'px',
		margins

	};	
	const chartSpace = isReady ? <CallGraphStatsSpace
				workspaceData={workspaceData}
				dimensions={dimensions}
				selKey={selKey} graphData={graphData} /> :
					<></>;
	return (
		<div id="cgspace_container" ref={cgstatsSpace} className={style.cgSpaceContainer}>
		{chartSpace}
		</div>
	);
}
