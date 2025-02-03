import React, { ReactElement, useEffect, useRef, useState } from "react";
import style from '../styles/CGChart.module.css';
import * as d3 from "d3";
import {WorkspaceBufferMap} from "../workspace/WorkspaceBufferMap";
import { CallGraphStatsData, CUAggrKey, CUDataKeyRef, CUScaleKeyRef, 
	DataAggregate, DataAggrIdentifier, DataAggrMap } from "./ChartData";


const onNodeClick = () => {
	//TODO: Clean this up
}

const LineColorList: Array<string> = [
	'#1a6fb0',
	'#ba6fa0',
	'#8a2922',
	'#6a1ff0',
	'#1a6fb4',
	'#b1ee28',
	'#777777',
	'#336699',
	'#441188',
]

const CircleColorList: Array<string> = [
	'#1a6fb0',
	'#ba6fa0',
	'#8a2922',
	'#6a1ff0',
	'#1a6fb4',
	'#b1ee28',
	'#777777',
	'#336699',
	'#441188',
]

/*const WidgetSelector = (props: WidgetSelectorProps): ReactElement => {
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
}*/
type CacheSelectorProps = {
	currentKeyRef: CUScaleKeyRef 
	keyRefUpdate: (key: string) => void
	optPairs: Array<{
		value: string 
		display: string
	}>
}

const CacheSelector = (props: CacheSelectorProps): ReactElement => {

	const selected = props.currentKeyRef.keyvalue;
	
	const keyRefUpdate = props.keyRefUpdate;

	const onOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		keyRefUpdate(e.currentTarget.value);
	};
	
	const options = props.optPairs.map((e, i) => {
		return (
			<option key={`cacsel_${i}`} 
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

const GenerateLegend = (
	names: Array<string>,
	colors: Array<string>,
	enableSet: Array<boolean>,
	setEnableSet: (d: boolean[]) => void
): ReactElement => {

	const linesGend = names.map((name, idx) => {
		const col = colors[idx];
		const isSet = enableSet[idx];
		let legStyles = `${style.legendEntry}`;
		if(!isSet) {
			legStyles = `${style.legendEntry} ${style.fadedEntry}`;
		}

		return (
			<div key={`lin_legend_${idx}`} className={legStyles}
				onClick={() => {
					const cur = enableSet[idx];
					const nSet = [...enableSet];
					nSet[idx] = !cur;
					setEnableSet(nSet);
					}
				}>
			<span>{name}:</span>
			<div className={style.legendBox} 
			style={{backgroundColor: col}}></div>
			</div>
		)

	});

	return (
		<div className={style.legendContainer}>
		{linesGend}
		</div>
	)
}

const GenerateLine = (
	data: DataAggregate,
	xScale: d3.ScaleLinear<number, number>,
	yScale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>, 
	selKey: CUAggrKey,
	colorStr: string,
	key: string, idx: number):  ReactElement => {	

	const lbuilder = d3
			.line<DataAggrIdentifier>()
			.x((d) => xScale(d.mxid ?? 0))
			.y((d, ids) => yScale(data.aggrMap[selKey][ids] ?? 0));

	const lres = lbuilder(data.idxs);

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
	data: DataAggregate,
	xScale: d3.ScaleLinear<number, number>,
	yScale: d3.ScaleLinear<number, number>, 
	selKey: CUAggrKey,
	colorStr: string,
	bmap: WorkspaceBufferMap): Array<ReactElement> => {

	const cnode = bmap.get('current_chart_idx');
	let selectedIdx = -1;
	let selectedRefId = -1;
	let selectedLine = -1;
	if(cnode) {
		const jcnode = JSON.parse(cnode);
		if(jcnode) {
			selectedIdx = jcnode.idx;
			selectedRefId = jcnode.refIdx;
			selectedLine = jcnode.lineIdx;
		}
	}

	return data.idxs.map((sample, i) => {
		
		const onNodeHoverTrigger = (isCuid: boolean) => {
			if(isCuid) {
				bmap.insert('current_node',
				JSON.stringify({
					idx: sample.cuid
				}));
			}
			bmap.insert('current_chart_idx', 
			JSON.stringify({
				idx: i,
				refIdx: sample.mxid,
				selKey: selKey,
				lineIdx: lIdent,
			}));
			bmap.commit();
		}
		const mxid = sample.mxid;
		const isCuidObj = (sample.cuid !== null && sample.cuid !== undefined)
		const selectedObj = (selectedIdx === i) &&
			(selectedRefId === sample.mxid) &&
			(selectedLine === lIdent);
		const selStyle = !isCuidObj ? style.cuObjectNotCuidSelected : selectedObj ? 
			style.cuObjectSelected : '';
		const actionMouseOver = sample.cuid !== null ||
			sample.cuid !== undefined ? onNodeHoverTrigger :
			(_gg: any) => {};
		return (<circle
			key={`circ_${i}`}
			cx={xScale(mxid)}
			cy={yScale(data.aggrMap[selKey][i])}
			r={4}
			stroke={colorStr}
		        fill={colorStr}
		        strokeWidth={1}
			className={`${style.cuObject} ${selStyle}`}
			onMouseOver={() => actionMouseOver(isCuidObj)}
			onClick={onNodeClick}
			/>
		)
	});
}


const ChartOptionPairs = [
	{ value: 'ALL', display: 'All'},
	{ value: 'REGISTER_VOLUME', display: 'Register Volume'},
	{ value: 'FACTORY_VOLUME', display: 'Factory Volume'},
	{ value: 'ROUTING_VOLUME', display: 'Routing Volume'},
	{ value: 'T_IDLE_VOLUME', display: 'T-Idle Volume'},
	{ value: 'BELL_IDLE_VOLUME', display: 'Bell-Idle Volume'},
	{ value: 'BELL_ROUTING_VOLUME', display: 'Bell-Routing Volume'}
];

type HDatKind = {
	hlen: number
	hArr: Array<number> 
	hIdx: number
}

function ToggleCacheData(data: DataAggregate, cacheOn: boolean): DataAggregate {
	if(cacheOn) {
		return data;
	}
	const aggrData = [[],[],[],[],[],[]]
	const daggr : DataAggregate = {
		globalMinMax: data.globalMinMax,
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
	for(let i = 0; i < data.idxs.length; i++) {
		const idref = data.idxs[i];
		if(idref.cuid !== null) {
			for(let j = 0; j < daggr.dataRefs.length; j++) {
				const dref = daggr.dataRefs[j];
				dref.push(data.dataRefs[j][i]);
			}
			daggr.idxs.push(idref);
		}
	}
	return daggr;
}

export const CallGraphStatsSpace = (props: CallGraphStatsData) => {

	const [cacheref, setCacheRef] = useState<CUScaleKeyRef>({keyvalue: 'ON'});
	const cacheIncluded = cacheref.keyvalue === 'ON';
	const data = ToggleCacheData(props.graphData, cacheIncluded);
	const gMinY = data.globalMinMax.minY;
	const gMaxY = data.globalMinMax.maxY;
	const keyset = Object.keys(data.aggrMap);
	const [enableSet, setEnableSet] = useState<Array<boolean>>(
		ChartOptionPairs.map((_) => true) 
	);
	const nCols = data.idxs.map((_, idx) => CircleColorList[idx %
						CircleColorList.length])
	const nLins = data.idxs.map((_, idx) => LineColorList[idx % 
				    		LineColorList.length])
	
	const bmap = props.workspaceData.bufferMap;
	const [keyref, setKeyRef] = useState<CUDataKeyRef>({ keyvalue: props.selKey });
	//const [lineref, setLineRef] = useState<CUWidgetKeyRef>({ keyvalue: -1 });
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
	//const selKey = (keyref.keyvalue) as CUDataKey;
	const scaleFnStr = scaleref.keyvalue;
	
	const [wDat, _wLen] = [data.idxs, data.idxs.length];
	/*const [wDat, _wLen] = data.idxs.map((e,i) => [e,i] as [DataAggrIdentifier, number])
		.reduce((p, c, _, _a) => {
			return p[0].length > c[0].length ? p : c; 
		});*/
	//TODO: Apparently the TS devs have not worked out this expression
	//with their parser >.>
	const { hArr } = data.dataRefs.map((e,i) => {
			return { hlen: Math.max(...e), hArr: e, hIdx: i } as HDatKind; 
		}).reduce((p: HDatKind, c: HDatKind, _, _a) =>  {
			if(p.hlen > c.hlen) {
				return { hlen: p.hlen, hArr: p.hArr, hIdx: p.hIdx } as HDatKind;
			} else {
				return { hlen: c.hlen, hArr: c.hArr, hIdx: c.hIdx} as HDatKind;
			}
		});

	let hDat = hArr;
	if(keyref.keyvalue !== 'ALL') {
		const akey = keyref.keyvalue as keyof DataAggrMap;
		if(akey) {
			hDat = data.aggrMap[akey];
		}
	}
	const [xMin, xMax] = d3.extent(wDat, (d: DataAggrIdentifier) => d.mxid);	
	const xScale = d3.scaleLinear()
		.domain([xMin || 0, xMax || 0])
		.range([0, boundsWidth]);

	let [yMin, yMax] = d3.extent(hDat, (d: number) => d);
	if(keyref.keyvalue === 'ALL') {
		if(scaleFnStr === 'Log') {
			yMin = gMinY;
			yMax = gMaxY;
		} else {

			yMin = 0;
		}
	} else {
		if(scaleFnStr === 'Linear') {
			yMin = 0;
		}
	}

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
		setEnableSet(ChartOptionPairs.map((_) => true));
	}
	const scalerefUpdate = (key: string) => {
		setScaleRef({ keyvalue: key });
	}

	const cacheRefUpdate = (key: string) => {
		setCacheRef({ keyvalue: key });
		setEnableSet(ChartOptionPairs.map((_) => true));
	}
	const circs = data.dataRefs.map((d, idx) => { 
		//if(keyref.keyvalue === 'All' || akey === data.aggrMap[) {
		//	return GenerateNodes(idx, data, xScale, yScale, selKey, lineCol[idx], bmap)
		if(enableSet[idx]) {

			const refKey = keyref.keyvalue === 'ALL' ? keyset[idx] : keyref.keyvalue;
			const akey = refKey as keyof DataAggrMap;
			
			if(keyref.keyvalue === 'ALL' || d === data.aggrMap[akey]) { 	
			   return GenerateNodes(idx, data, xScale, yScale, akey, lineCol[idx], bmap)
			} else {
				return <></>
			}
		}
	});
	const lines = data.dataRefs.map((d, idx) => {
		if(enableSet[idx]) {
			const key = `lin_${idx}`;
			const refKey = keyref.keyvalue === 'ALL' ? keyset[idx] : keyref.keyvalue;
			const akey = refKey as keyof DataAggrMap;
			if(keyref.keyvalue === 'ALL' || d === data.aggrMap[akey]) { 	
				return GenerateLine(data, xScale, yScale, akey, nodeCol[idx], key, idx);
			} else {
				return <></>
			}
		}
	});
	
	let legndNames = [];
	let colorsIncluded = LineColorList;
	let setEnableProxy: (d: boolean[]) => void = setEnableSet; 
		
	if(keyref.keyvalue === 'ALL') {
		legndNames = ChartOptionPairs.slice(1).map((pair) => {
			return pair.display;
		});
	} else {
		colorsIncluded = [];
		legndNames = ChartOptionPairs.slice(1).filter((pair, idx) => {

			const res = keyref.keyvalue === pair.value;
			if(res) { colorsIncluded.push(LineColorList[idx]) };
			return res;
		}).map((p) => p.display);
		setEnableProxy = (_: Array<boolean>):void => {};

	}
	
	//Because ain't we just a legend mateeee
	const legendBro = GenerateLegend(legndNames, colorsIncluded, enableSet, setEnableProxy);

	//const idxes = [{value:-1,display:'All'}]
	//	.concat(data.map((_, idx) => { return {value: idx, display: `${idx+1}`} }));

	const cacheOpts = [{value: 'ON', display: 'Cached Included'}, 
		{value: 'OFF', display: 'Cached Removed'}];
	const scaleOpts = [{value: 'Linear', display: 'Linear'}, {value: 'Log', display: 'Log'}];
	return (
		<div className={style.graphContainer}>
			<div className={style.cgvisTab}>
			<ChartSelector optPairs={ChartOptionPairs} 
				currentKeyRef={keyref}
				keyRefUpdate={keyrefUpdate}/>
			<CacheSelector optPairs={cacheOpts} 
				currentKeyRef={cacheref}
				keyRefUpdate={cacheRefUpdate}/>
			<ScaleSelector optPairs={scaleOpts}
				currentKeyRef={scaleref}
				keyRefUpdate={scalerefUpdate} />
		
			</div>

			<div>
			<svg width={width} height={height}>
			<g
				width={boundsWidth}
				height={boundsHeight}
				transform={`translate(${[left, top].join(",")})`}
				>
				{lines}	
			</g>
			<g
				width={boundsWidth}
				height={boundsHeight}
				ref={chartRef}
				transform={`translate(${[left, top].join(",")})`}
				>
			</g>
			<g
				width={boundsWidth}
				height={boundsHeight}	
				transform={`translate(${[left, top].join(",")})`}
				>
				{circs}
			</g>
			</svg>
			{legendBro}

			</div>
			<div className={style.nodesComponent}>
			
			</div>

		</div>
	)
}
