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

type CellInfo = {
	taggedKind: number
	updateCell?: () => void
}

/**
 * Outlines how many cells there is to be
 * created.
 */
export type GridData = {
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
			console.log("Yo!");
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
		const renderableCells = 
			this.state.cells.map((c, _) => <GridCell cell={c} 
						leftDown={gref.state.leftIsDown}
						toolKind={
							gref.props.container.getToolIndex()}
					     />);
		

		const mgdownEvent = (e: React.MouseEvent<HTMLUListElement>) => {
			gref.onGridDown(e);
		}
		const mgmoveEvent = (e: React.MouseEvent<HTMLUListElement>) => {

			gref.onGridMove(e);
		}
		const mgupEvent = (e: React.MouseEvent<HTMLUListElement>) => {
			gref.onGridUp(e);
		}

		return (
			<div className={styles.designSpaceContainer}>
				<ul className={styles.designSpaceGrid} 
					onMouseDown={mgdownEvent}
					onMouseMove={mgmoveEvent}
					onMouseUp={mgupEvent}
					style={ { 
						left: gref.state.mousePosition[0],
						top: gref.state.mousePosition[1] 
					}}>
					{renderableCells}
				</ul>
			</div>
		)
	}

}

