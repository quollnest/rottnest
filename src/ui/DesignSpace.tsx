import React from 'react';
import { GridCell } from './grid/GridItem.tsx'
import SelectionVisual from './grid/SelectionVisual.tsx';

import styles from './styles/DesignSpace.module.css'
import RottnestContainer from './container/RottnestContainer.tsx';
import {RegionCell} from '../model/Project.ts';

/**
 * Selection Box
 */
type SelectionRect = {
	x1: number
	y1: number
	x2: number
	y2: number
}

/**
 * At the moment, nothing being used here
 */
type GridState = {
	cells: Array<CellInfo>
	mousePosition: [number, number]
	middleIsDown: boolean
	leftIsDown: boolean
	startSelected: boolean
	selectionRect: SelectionRect
	startCell: RegionCell
	endCell: RegionCell
	paintMode: boolean
}

/**
 * CellInfo
 * taggedKind is the kind of region that
 * had been marked
 *
 * The updateCell is nullable, was reserved for
 * something else
 * TODO: Evaluate if updateCell still needs to exist
 */
type CellInfo = {
	taggedKind: number
	updateCell?: () => void
	isSelected: boolean
}

/**
 * Aggregation of cellinfo and region cell
 */
type RegionCellAggr = {
	cinfo: CellInfo
	regData: RegionCell 
	isSelected: boolean
}

/**
 * Outlines how many cells there is to be
 * created.
 */
export type GridData = {
	zoomValue: number
	container: RottnestContainer
	toolKind: number
	width: number
	height: number
}

/**
 * DesignSpace will display the grid and have
 * a reference to regions that are placed on it. 
 */
export class DesignSpace extends React.Component<GridData, GridState> {
	
	state: GridState = {
		cells: DesignSpace.FillCells(this.props.width, 
					     this.props.height),
		mousePosition: [0, 0],
		middleIsDown: false,
		leftIsDown: false,
		selectionRect: { x1: 0, x2: 0, y1: 0, y2: 0 },
		startSelected: false,
		startCell: { x: 0, y: 0 },
		endCell: { x: 0, y: 0 },
		paintMode: false

	}

	static FillCells(width: number, height: number): 
		Array<CellInfo> {
		
		const total = width * height;
		const things = []
		for(let i = 0; i < total; i++) {
			things.push({ 
				taggedKind: 0,
				updateCell: function() {},
				isSelected: false

			});
		}

		return things;
	}

	resetSelection() {
		for(let i = 0; i < this.state.cells.length; i++) {
			this.state.cells[i].isSelected = false;
		}
	}
	

	onGridDown(e: React.MouseEvent<HTMLUListElement>) {
		if(e.button === 1) {
			const x = e.movementX;
			const y = e.movementY;
			
			let newGS = {...this.state};
			
			let [oX, oY] = newGS.mousePosition
			newGS.mousePosition = [
				oX + x,
				oY + y
			];
			newGS.middleIsDown = true;
			this.setState(newGS);

			
		} else {
			this.onLeftDown(e)
			}
	}

	onGridMove(e: React.MouseEvent<HTMLUListElement>) {
		if(this.state.middleIsDown) {
			const x = e.movementX;
			const y = e.movementY;

			let newGS = {...this.state};
			let [oX, oY] = newGS.mousePosition
			newGS.mousePosition = [
				oX + x,
				oY + y
			];
			this.setState(newGS);
		} else {
			this.onLeftMove(e);
		}
	}

	onGridUp(_: React.MouseEvent<HTMLUListElement>) {
		//1. Needs to construct RegionData:
		//2. Send the old RegionDataList to undo stack
		//3. Add the RegionData to RegionDataList
		//4. Set the new RegionDataList and refresh
		//5. Add the region to RegionList component
		
		if(this.state.leftIsDown) {
			//const container = this.props.container;
			//Deduce the key value
			//container.applyRDBuffer();

			//let newGS = {...this.state};
			//newGS.middleIsDown = false;
			//newGS.leftIsDown = false;
			this.onSelectFinish();
			//this.setState(newGS);
		} else if(this.state.middleIsDown) {
			this.onMiddleUp();
		}
		
	}

	onMiddleUp() {
		const newGS = {...this.state};
		newGS.leftIsDown = false;
		newGS.middleIsDown = false;
		this.setState(newGS);
	}

	
	onLeftDown(e: React.MouseEvent<HTMLUListElement>) {
		if(e.button === 0) {
			
			let newGS = {...this.state};
			newGS.selectionRect.x1 = e.clientX;
			newGS.selectionRect.x2 = e.clientX;
			newGS.selectionRect.y1 = e.clientY;
			newGS.selectionRect.y2 = e.clientY;
			newGS.leftIsDown = true;
			
			this.setState(newGS);
		}
	}

	selectionMove(newX: number, newY: number) {
		if(this.state.leftIsDown) {	
			let newGS = {...this.state};
			
			const x = newX;
			const y = newY;
			newGS.selectionRect.x2 = x;
			newGS.selectionRect.y2 = y;
			this.setState(newGS);
		}


	}


	/**
	 * This is used to detect 
	 */
	onLeftMove(e: React.MouseEvent<HTMLUListElement>) {
		//1. Start drawing a rectangle
		//2. Start doing detection on the grid
		this.selectionMove(e.clientX, e.clientY);
	}

	onLeftUp(_: React.MouseEvent<HTMLUListElement>) {
		
		this.onSelectFinish();
	}

	onSelectFinish() {
		
		let newGS = {...this.state};	
		const container = this.props.container;
		this.tagSelectedData();	
		
		if(container.getCurrentRDBuffer().empty()) {
			container.applyRDBuffer();
		}
		
		newGS.middleIsDown = false;
		newGS.leftIsDown = false;
		newGS.startSelected = false;
		newGS.selectionRect = { x1: 0, x2: 0, y1: 0, 
			y2: 0 };
		newGS.startCell = { x: 0, y: 0 };
		newGS.endCell = { x: 0, y: 0 };
		this.resetSelection();
		this.setState(newGS);
	}
	
	tagSelectedData() {
		const cells = this.selectCells();
		const container = this.props.container;
		
		for(let [_, v] of cells) {
			container.getCurrentRDBuffer()
				.insert(v.regData);
		}

	}

	getSelectionData() {
		let x1 = this.state.leftIsDown ? 
			this.state.selectionRect.x1 : 0;
		let x2 = this.state.leftIsDown ? 
			this.state.selectionRect.x2 : 0;
		let y1 = this.state.leftIsDown ? 
			window.scrollY + 
			this.state.selectionRect.y1 : 0;
		let y2 = this.state.leftIsDown ? 
			window.scrollY + 
			this.state.selectionRect.y2 : 0;

		if(x1 > x2) {
			let tmp = x1;
			x1 = x2;
			x2 = tmp;
		}

		if(y1 > y2) {
			let tmp = y1;
			y1 = y2;
			y2 = tmp;
		}
		return {
			x1, x2, y1, y2,
		};
	}	

	getCoordsFromSelectionData() {

		let x1 = this.state.leftIsDown ? 
			this.state.startCell.x : 0;
		let x2 = this.state.leftIsDown ? 
			this.state.endCell.x : 0;
		let y1 = this.state.leftIsDown ? 
			this.state.startCell.y : 0;
		let y2 = this.state.leftIsDown ? 
			this.state.endCell.y : 0;

		if(x1 > x2) {
			let tmp = x1;
			x1 = x2;
			x2 = tmp;
		}

		if(y1 > y2) {
			let tmp = y1;
			y1 = y2
			y2 = tmp;
		}

		return { x1, x2, y1, y2 }
	}

	onWheelTrigger(e: React.WheelEvent<HTMLUListElement>) {
		const container = this.props.container;
		if(e.deltaY < 0) {
			container.zoomIn(25);
		} else if(e.deltaY > 0) {
			container.zoomIn(-25);
		}

	}

	selectCells(): Map<string, RegionCellAggr> {

		const box = this.getCoordsFromSelectionData();
		const width = this.props.width;
		let items: Map<string, RegionCellAggr> = new Map();
		if((box.x1 - box.x2 != 0 || box.y1 - box.y2 != 0)
		  && this.state.leftIsDown) { 
			for(let y = box.y1; y <= box.y2; y++) {
				for(let x = box.x1; x <= box.x2; 
				    x++) {

					items.set(`x${x} y${y}`,
					{
					cinfo: 
					this.state
					.cells[(y * width) 
						+ x],
					regData: {
							x: x,
							y: y
						},	
					isSelected: true
					});
				}
			}
		}

		return items;
	}

	potentialStartMark(x: number, y: number) {
		if(!this.state.startSelected) {
			this.state.startSelected = true;
			this.state.startCell.x = x;
			this.state.startCell.y = y;
		}
	}
	
	potentialEndMark(x: number, y: number) {	
		this.state.endCell.x = x;
		this.state.endCell.y = y;
	}

	redoCells(width: number, height: number) {
		const newState = {...this.state};
		newState.cells = DesignSpace.FillCells(width, 
						       height);
		this.setState(newState);
	}

	render() {
		const gref = this;
		const container = this.props.container;
		const zoomValue = this.props.zoomValue;
		const gwidth = gref.props.width;
		const paintMode = this.state.paintMode;

		container.registerDesignSpace(gref);

		const mgdownEvent = (e: 
			React.MouseEvent<HTMLUListElement>) => {
			gref.onGridDown(e);
		}
		const mgmoveEvent = (e: 
			React.MouseEvent<HTMLUListElement>) => {

			gref.onGridMove(e);
		}
		const mgupEvent = (e: 
			React.MouseEvent<HTMLUListElement>) => {
			gref.onGridUp(e);
		}

		const onWheelie = (e:
			React.WheelEvent<HTMLUListElement>) => {
			gref.onWheelTrigger(e);
		}

		const dataTagFn = (x: number, y: number) => {
			gref.potentialStartMark(x, y);
			gref.potentialEndMark(x, y);
			if(paintMode) {
				container.getCurrentRDBuffer()
					.insert({ x, y })
			}	
		}
	
	let selectMap = this.selectCells();

		//TODO: We may want to maintain
		//this list of pre-rendered cells
		const renderableCells = 
			this.state.cells.map((_, idx) => {
				const x = idx % gwidth;
				const y = Math.floor(idx / gwidth);
				//console.log(c);
				return (
					<GridCell key={idx} cell={
					{
						taggedKind: container
						.getRegionList()
						.getTagFromCoords(
						idx % gwidth,
						Math.floor(idx / 
							   gwidth))
					}
				}
				paintMode={this.state.paintMode}
				isSelected={
					selectMap.get(`x${x} y${y}`) 
					!= null	
				}
				x={x}
				y={y}
				leftDown={
					gref.state.leftIsDown
				}
				toolKind={
					gref.props.container
					.getToolIndex()
				}
				
				tagFn={dataTagFn}
			     />
				)
			});
		
		const svprops = this.getSelectionData();
		
		return (
			<div draggable={false} className={
				styles
				.designSpaceContainer}>

				<SelectionVisual  
					coordsRef={svprops} 
					container={gref}/>

				<ul draggable={false} className={
						styles
						.designSpaceGrid
					}
					onWheel={onWheelie}
					onMouseDown={mgdownEvent}
					onMouseMove={mgmoveEvent}
					onMouseUp={mgupEvent}
					style={ { 
						left: 
						gref.state
						.mousePosition[0],
						top: 
						gref.state
						.mousePosition[1],
						width: 
						`${zoomValue}%`,
						gridTemplateColumns: 
						`repeat(${gwidth},1fr)`
					}}>
					{renderableCells}
				</ul>
			</div>
		)
	}
}

