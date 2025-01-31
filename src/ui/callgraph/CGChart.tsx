import React, { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import {CUVolume} from "../../model/CallGraph";
import style from '../styles/CGChart.module.css';
import * as d3 from "d3";
import {WorkspaceData} from "../workspace/Workspace";
import {WorkspaceBufferMap} from "../workspace/WorkspaceBufferMap";


type CUDataKey = keyof CUVolume;

export type CGSample = {
	refId: string
	widgetIdx: number
	cuVolume: CUVolume 
}

export type CGMargins = {
	top: number
	bottom: number
	left: number
	right: number
}

export type CGChartDimensions = {
	wUnit: string
	width: number
	hUnit: string
	height: number
	margins: CGMargins
}

export type CallGraphSpaceData = {
	workspaceData: WorkspaceData
	graphData: Array<Array<CGSample>>
	selKey: string 

}

export type CallGraphStatsData = {
	workspaceData: WorkspaceData
	graphData: Array<Array<CGSample>>
	selKey: CUDataKey
	dimensions: CGChartDimensions	
}

const onNodeOver = () => {
	
}

const onNodeClick = () => {

}

const LineColorList: Array<string> = [
	'#1a6fb0',
	'#ba6fa0',
	'#8a2922',
	'#6a1ff0',
	'#1a6fb4',
	'#b1ee28',
]

const CircleColorList: Array<string> = [
	'#1a6fb0',
	'#ba6fa0',
	'#8a2922',
	'#6a1ff0',
	'#1a6fb4',
	'#b1ee28',
]

type CUDataKeyRef = {
	keyvalue: string 
}

type CUWidgetKeyRef = {
	keyvalue: number 
}

type CUScaleKeyRef = {
	keyvalue: string 
}

type WidgetSelectorProps = {
	currentKeyRef: CUWidgetKeyRef
	keyRefUpdate: (key: number) => void
	optPairs: Array<{
		value: number 
		display: string 
	}>

}

const WidgetSelector = (props: WidgetSelectorProps): ReactElement => {
	const selected = props.currentKeyRef.keyvalue;
	const keyRefUpdate = props.keyRefUpdate;

	const onOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		keyRefUpdate(Number(e.currentTarget.value));
	};
	
	const options = props.optPairs.map((e, i) => {
		return (
			<option key={`cline_${i}`} 
				value={e.value}>{e.display}</option>
		);
	});

	return (<div className={style.chartSel}>
		<select value={selected} onChange={onOptionChange}
			className={style.optionStyle}>
			{options}
		</select>
	       </div>)
}

type ScaleProps = {
	currentKeyRef: CUScaleKeyRef
	keyRefUpdate: (key: string) => void
	optPairs: Array<{
		value: string 
		display: string
	}>
}

const ScaleSelector = (props: ScaleProps): ReactElement => {

	const selected = props.currentKeyRef.keyvalue;
	
	const keyRefUpdate = props.keyRefUpdate;

	const onOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		keyRefUpdate(e.currentTarget.value);
	};
	
	const options = props.optPairs.map((e, i) => {
		return (
			<option key={`copt_${i}`} 
				value={e.value}>{e.display}</option>
		);
	});

	return (<div className={style.chartSel}>
		<select value={selected} onChange={onOptionChange}
			className={style.optionStyle}>
			{options}
		</select>
	       </div>)
}

type ChartSelectorProps = {

	currentKeyRef: CUDataKeyRef
	keyRefUpdate: (key: string) => void
	optPairs: Array<{
		value: string 
		display: string
	}>
}


const ChartSelector = (props: ChartSelectorProps): ReactElement => {


	const selected = props.currentKeyRef.keyvalue;
	
	const keyRefUpdate = props.keyRefUpdate;

	const onOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		keyRefUpdate(e.currentTarget.value);
	};
	
	const options = props.optPairs.map((e, i) => {
		return (
			<option key={`copt_${i}`} 
				value={e.value}>{e.display}</option>
		);
	});

	return (<div className={style.chartSel}>
		<select value={selected} onChange={onOptionChange}
			className={style.optionStyle}>
			{options}
		</select>
	       </div>)

}

const GenerateLine = (
	data: Array<CGSample>,
	xScale: d3.ScaleLinear<number, number>,
	yScale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>, 
	selKey: CUDataKey,
	colorStr: string,
	key: string):  ReactElement => {

	const lbuilder = d3
			.line<CGSample>()
			.x((d) => xScale(d.widgetIdx))
			.y((d) => yScale(d.cuVolume[selKey]));
	const lres = lbuilder(data);
	return (<path
		    key={key}
		    className={style.cgline}
		    d={lres ? lres : ''}
		    opacity={1}
		    stroke={colorStr}
		    fill="none"
		    strokeWidth={3}
		/>)
}

const GenerateNodes = (
	lIdent: number,
	data: Array<CGSample>,
	xScale: d3.ScaleLinear<number, number>,
	yScale: d3.ScaleLinear<number, number>, 
	selKey: CUDataKey,
	colorStr: string,
	bmap: WorkspaceBufferMap): Array<ReactElement> => {

	const cnode = bmap.get('current_chart_idx');
	let selectedIdx = -1;
	let selectedRefId = '';
	let selectedLine = -1;
	if(cnode) {
		const jcnode = JSON.parse(cnode);
		if(jcnode) {
			selectedIdx = jcnode.idx;
			selectedRefId = jcnode.refIdx;
			selectedLine = jcnode.lineIdx;
		}
	}

	return data.map((sample, i) => {
		const onNodeHoverTrigger = () => {
			bmap.insert('current_node', 
			JSON.stringify({
				idx: sample.refId 
			}));
			bmap.insert('current_chart_idx', 
			JSON.stringify({
				idx: i,
				refIdx: sample.refId,
				selKey: selKey,
				lineIdx: lIdent,
			}));
			bmap.commit();
		}
		const selStyle = (selectedIdx === i) &&
			(selectedRefId === sample.refId) &&
			(selectedLine === lIdent)? 
			style.cuObjectSelected : '';
		
		return (<circle
			key={`circ_${i}`}
			cx={xScale(sample.widgetIdx)}
			cy={yScale(sample.cuVolume[selKey])}
			r={5}
			stroke={colorStr}
		        fill={colorStr}
		        strokeWidth={2}
			className={`${style.cuObject} ${selStyle}`}
			onMouseOver={onNodeHoverTrigger}
			onClick={onNodeClick}
			/>
		)
	});
}

export const CGChartSpace = (props: CallGraphSpaceData): ReactElement => {
	
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
const ChartOptionPairs = [
	{ value: 'REGISTER_VOLUME', display: 'Register Volume'},
	{ value: 'FACTORY_VOLUME', display: 'Factory Volume'},
	{ value: 'ROUTING_VOLUME', display: 'Routing Volume'},
	{ value: 'T_IDLE_VOLUME', display: 'T-Idle Volume'}
];

export const CallGraphStatsSpace = (props: CallGraphStatsData) => {

	const data = props.graphData;
	const nCols = data.map(() => CircleColorList[Math.floor((Math.random() * CircleColorList.length))])
	const nLins = data.map(() => LineColorList[Math.floor((Math.random() * LineColorList.length))])
	const bmap = props.workspaceData.bufferMap;
	const [keyref, setKeyRef] = useState<CUDataKeyRef>({ keyvalue: props.selKey });
	const [lineref, setLineRef] = useState<CUWidgetKeyRef>({ keyvalue: -1 });
	const [scaleref, setScaleRef] = useState<CUScaleKeyRef>({keyvalue: 'Linear'});
	const [lineCol, _setLineCol] = useState<Array<string>>(nLins);
	const [nodeCol, _setNodeCol] = useState<Array<string>>(nCols);
	const chartRef = useRef() as React.MutableRefObject<SVGSVGElement>;
	const margins = props.dimensions.margins;

	const left = margins.left;
	const mWidth = margins.left + margins.right;
	const mHeight = margins.top + margins.bottom;
	const top = margins.top;
	const width = props.dimensions.width;
	const height = props.dimensions.height;
	const boundsWidth = width - mWidth;
	const boundsHeight = height - mHeight;
	const selKey = (keyref.keyvalue) as CUDataKey;
	const scaleFnStr = scaleref.keyvalue;
	
	const [wDat, _wLen] = data.map((e,i) => [e,i] as [CGSample[], number])
		.reduce((p, c, _, _a) => {
			return p[0].length > c[0].length ? p : c; 
		});

	const [_, hDat, _hIdx]: [number, CGSample[], number] = data.map((e,i) => {
			const hLen = e
				.map((t) => t.cuVolume[selKey])
				.reduce((p,c) => p+c);
			return ([hLen,e, i]) as [number, CGSample[], number];
			
		})
		.reduce((p, c, _, _a) => {
			return p[0] > c[0] ? p : c;	
		});
	const [xMin, xMax] = d3.extent(wDat, (d: CGSample) => d.widgetIdx);	
	const xScale = useMemo(() => {
		return d3.scaleLinear()
		.domain([xMin || 0, xMax || 0])
		.range([0, boundsWidth])
	}, [data, width]);

	const [yMin, yMax] = d3.extent(hDat, (d: CGSample) => d.cuVolume[selKey]);
	const scaleFn = scaleFnStr === 'Linear' ? d3.scaleLinear : d3.scaleLog;
	const yScale = scaleFn() 
		.domain([yMin || 0, yMax || 0])
		.range([boundsHeight, 0])

	useEffect(() => {

		const chartRes = d3.select(chartRef.current);	
		chartRes.selectAll("*")
			.remove();
		const xAxisGen = d3.axisBottom(xScale);

		chartRes.attr('width', width)
			.attr('height', height)
			.append('g')
				.attr('transform',
				     `translate(${0},${boundsHeight})`)
			.call(xAxisGen);
				

		const yAxisGen = d3.axisLeft(yScale);
		chartRes
			.append("g")
			.call(yAxisGen);

				

	}, [xScale, yScale, height]);
	
	const keyrefUpdate = (key: string) => {
		setKeyRef({ keyvalue: key });
	}
	const linrefUpdate = (key: number) => {
		setLineRef({ keyvalue: key });
	}
	const scalerefUpdate = (key: string) => {
		setScaleRef({ keyvalue: key });
	}


	const circs = data.map((d, idx) => { 
		
		if(lineref.keyvalue === -1 || lineref.keyvalue === idx) {
			return GenerateNodes(idx, d, xScale, yScale, selKey, lineCol[idx], bmap)
		} else {
			return <></>
		}
	});
	const lines = data.map((d, idx) => {
		const key = `lin_${idx}`;
		if(lineref.keyvalue === -1 || lineref.keyvalue === idx) {
			return GenerateLine(d, xScale, yScale, selKey, nodeCol[idx], key);
		} else {
			return <></>
		}
	});
	const idxes = [{value:-1,display:'All'}]
		.concat(data.map((_, idx) => { return {value: idx, display: `${idx+1}`} }));

	const scaleOpts = [{value: 'Linear', display: 'Linear'}, {value: 'Log', display: 'Log'}];
	return (
		<div className={style.graphContainer}>
			<div className={style.cgvisTab}>
			<ChartSelector optPairs={ChartOptionPairs} 
				currentKeyRef={keyref}
				keyRefUpdate={keyrefUpdate}/>
			<WidgetSelector optPairs={idxes} 
				currentKeyRef={lineref}
				keyRefUpdate={linrefUpdate}/>
			<ScaleSelector optPairs={scaleOpts} 
				currentKeyRef={scaleref}
				keyRefUpdate={scalerefUpdate}/>
			</div>
			<div>
			<svg width={width} height={height}>
			<g
				width={boundsWidth}
				height={boundsHeight}
				transform={`translate(${[left, top].join(",")})`}>
				{lines}	
			</g>
			<g
				width={boundsWidth}
				height={boundsHeight}
				ref={chartRef}
				transform={`translate(${[left, top].join(",")})`}/>
			<g
				width={boundsWidth}
				height={boundsHeight}
				transform={`translate(${[left, top].join(",")})`}>
				{circs}
			</g>
			</svg>
			</div>
			<div className={style.nodesComponent}>
			
			</div>

		</div>
	)
}
