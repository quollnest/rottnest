import {ReactElement, useRef, useState, useEffect} from "react";
import {CallGraphSpaceData, CGChartDimensions, CGSample, CUDataKey} from "./ChartData";
import {CallGraphStatsSpace} from "./CGChart";

import style from '../styles/CGChart.module.css';
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
			}
		})
	}
	return data;
}

export const RunChartSpace = (props: CallGraphSpaceData): ReactElement => {
	
	const cgstatsSpace = useRef<any>();
	const [width, setWidth] = useState(600);
	const [height, setHeight] = useState(600);
	const [isReady, setReady] = useState(false);
	const selKey = props.selKey as CUDataKey;
	const graphData = props.graphData;
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
