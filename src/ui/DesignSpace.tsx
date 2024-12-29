import React from 'react';
import { GridCell, CellProps } from './grid/GridItem.tsx'

import styles from './styles/DesignSpace.module.css'
import RottnestContainer from './container/RottnestContainer.tsx';



/**
 * At the moment, nothing being used here
 */
type GridState = {
	cells: Array<CellInfo>
	mousePosition: [number, number]
	middleIsDown: boolean
	leftIsDown: boolean
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
 *
 */
export class DesignSpace extends React.Component<GridData, GridState> {
		
	state: GridState = {
		cells: new Array(this.props.height * this.props.width)
			.fill({ 
				taggedKind: 0,
				updateCell: function() {
					console.log("What?");
				}
			}),
		mousePosition: [0, 0],
		middleIsDown: false,
		leftIsDown: false,
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

		}
	}

	onGridUp(_: React.MouseEvent<HTMLUListElement>) {
		//1. Needs to construct RegionData:
		//2. Send the old RegionDataList to undo stack
		//3. Add the RegionData to RegionDataList
		//4. Set the new RegionDataList and refresh
		//5. Add the region to RegionList component
		
		const container = this.props.container;
		//Deduce the key value
		container.applyRDBuffer();

		let newGS = {...this.state};
		newGS.middleIsDown = false;
		newGS.leftIsDown = false;
		this.setState(newGS);
		
	}

	onLeftDown(e: React.MouseEvent<HTMLUListElement>) {
		if(e.button === 0) {	
			let newGS = {...this.state};
			newGS.leftIsDown = true;
			this.setState(newGS);
		}
	}


	render() {
		const gref = this;
		const container = this.props.container;
		const zoomValue = this.props.zoomValue;
		const gwidth = gref.props.width;
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

		const dataTagFn = (x: number, y: number) => {
			container.getCurrentRDBuffer()
				.insert({ x, y })	
		}


		const renderableCells = 
			this.state.cells.map((c, idx) => 
				<GridCell cell={
					{
						taggedKind: container
						.getRegionList()
						.getTagFromCoords(
						idx % gwidth,
						Math.floor(idx / 
							   gwidth))
					}
				}
				x={idx % gwidth}
				y={Math.floor(idx / gwidth)}
				leftDown={
					gref.state.leftIsDown
				}
				toolKind={
					gref.props.container
					.getToolIndex()
				}
				
				tagFn={dataTagFn}	
			     />);


		return (
			<div className={styles.designSpaceContainer}>
				<ul className={styles.designSpaceGrid} 
					onMouseDown={mgdownEvent}
					onMouseMove={mgmoveEvent}
					onMouseUp={mgupEvent}
					style={ { 
						left: gref
						.state
						.mousePosition[0],
						top: gref
						.state
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

