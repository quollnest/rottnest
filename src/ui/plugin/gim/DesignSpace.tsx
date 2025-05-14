
import React from 'react';

import {Workspace, WorkspaceData} from '../../workspace/Workspace.ts';
import {GimNodeKind, GimNode, GimFCInternal, GimFCGraph }
  from '../../../model/gim/Entity.ts';

import styles from '../../styles/GimDesignSpace.module.css'

/**
 * At the moment, nothing being used here
 */
type GridState = {
	cells: Array<CellInfo>
	gridPosition: [number, number]
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
 */
type CellInfo = {
	taggedKind: number
	updateCell?: () => void
	isSelected: boolean
}
/**
 * Outlines how many cells there is to be
 * created.
 */
export type GridData = {
	workspaceData: WorkspaceData
}

/**
 * DesignSpace will display the grid and have
 * a reference to regions that are placed on it. 
 */
export class GimDesignSpace extends React.Component<GridData, GridState> 
	implements Workspace {
		
	




	

	onGridDown(_e: React.MouseEvent<HTMLUListElement>) {
		
	}

	onGridMove(_e: React.MouseEvent<HTMLUListElement>) {
	}
	selectionMoveRel(_relX: number, _relY: number) {

	}

	selectionMove(_newX: number, _newY: number) {
	}


	onGridUp(_e: React.MouseEvent<HTMLUListElement>) {
		
	}

	resetMove() {
		const newGS = {...this.state};
		newGS.leftIsDown = false;
		newGS.middleIsDown = false;
		this.setState(newGS);
	}

	onMiddleUp(_x: number, _y: number) {

	}	

	onLeftDown(_e: React.MouseEvent<HTMLUListElement>) {
	}

	
	/**
	 * This is used to detect 
	 */
	onLeftMove(_e: React.MouseEvent<HTMLUListElement>) {
	}

	onLeftUp(_: React.MouseEvent<HTMLUListElement>) {
		
	}

	onSelectFinish() {
		
	}
	
	tagSelectedData() {

	}

	getSelectionData() {
			}	

	getCoordsFromSelectionData() {

			}

	onWheelTrigger(_e: React.WheelEvent<HTMLUListElement>) {

	}

	selectCells() {

	}

	potentialStartMark(_x: number, _y: number) {
	}
	
	potentialEndMark(_x: number, _y: number) {	
	}

	redoCells(_width: number, _height: number) {
	}

	render() {
		const gref = this;
		//
		// The container that will register and know what the new
		// 
		//container.registerDesignSpace(gref);

		const mgdownEvent = (e: React.MouseEvent<HTMLUListElement>) => {
			gref.onGridDown(e);
		}
		const mgmoveEvent = (e: React.MouseEvent<HTMLUListElement>) => {

			gref.onGridMove(e);
		}
		const mgupEvent = (e: React.MouseEvent<HTMLUListElement>) => {
			gref.onGridUp(e);
		}

		const onWheelie = (e: React.WheelEvent<HTMLUListElement>) => {
			gref.onWheelTrigger(e);
		}

		return (
			<div draggable={false} className={
				styles
				.designSpaceContainer}>

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
						.gridPosition[0],
						top: 
						gref.state
						.gridPosition[1],
					}}>
				</ul>
			</div>
		)
	}
}

