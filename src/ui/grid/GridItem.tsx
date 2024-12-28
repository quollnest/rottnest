import React from 'react';
import styles from '../styles/GridItem.module.css'

const GridStylesMap = {
	"Bus": styles.Bus,
	"Untagged": styles.Untagged,
	"Register": styles.Register,
	"BellState": styles.BellState,
	"TFactory": styles.TFactory,
	"Buffer": styles.Buffer,
}


/**
 * CellData object that has a tag
 * currently outlined as a number but
 * should be referred to via an enum or
 * something more descriptive/robust
 */
class CellData {
	taggedKind: number = 0;
	
	constructor(tagNum: number) {
		this.taggedKind = tagNum;
	}

	toStyleKey(): string {
		switch(this.taggedKind) {
			case 0:
				return "Untagged"
			case 1:
				return "Buffer"
			case 2:
				return "Bus"
			case 3:
				return "TFactory"
			case 4:
				return "BellState"
			case 5:
				return "Register"
			default:
				return "Untagged"
		}
	}
}

/**
 * Passes down properties related to the current
 * cell along with update functionality for where
 * the celldata is actually stored
 */
export type CellProps = {
	leftDown: boolean
	toolKind: number
	cell: {
		taggedKind: number
		updateCell?: () => void
	}
}


type CellState = {
	data: CellData

}

/**
 * Current GridCell object that forms part
 * of a large grid of object
 *
 */
export class GridCell extends React.Component<CellProps, CellState> {
	
	state: CellState = { 
		data: new CellData(0),
	}

	cellMouseMove(_: React.MouseEvent<HTMLDivElement>, tkind: number,
		     leftDown: boolean) {
		if(leftDown) {
			let newGCState = {...this.state};
			if(newGCState.data.taggedKind != tkind) {
				newGCState.data.taggedKind = tkind;
				this.setState(newGCState);
			}

		}
	}

	render() {

		const cref = this;
		const toolKind = cref.props.toolKind;
		const leftDown = cref.props.leftDown;
		const cdata = this.state.data;
		
		console.log(toolKind, leftDown);

		const mmove = (e: React.MouseEvent<HTMLDivElement>) => {
			cref.cellMouseMove(e, toolKind, leftDown)
		}
	       	
		return (
			<div className={`${styles.gridItem} ${GridStylesMap[cdata.toStyleKey()]}` }
				onMouseMove={mmove}>
				 
			</div>
		)
	}

}

