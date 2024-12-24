import React from 'react';
import styles from '../styles/GridItem.module.css'

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
				return "Register"
			case 2:
				return "Bus"
			case 3:
				return "BellState"
			case 4:
				return "TFactory"
			case 5:
				return "Buffer"
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
	taggedKind: number
	updateCell: () => void
}


/**
 * Current GridCell object that forms part
 * of a large grid of object
 *
 */
export class GridCell extends React.Component<CellProps, CellData> {
	
	state: CellData = new CellData(0); 
	
	render() {
		const data = this.props;	
		return (
			<div className={this.state.toStyleKey()} 
				onClick={data.updateCell}>
			</div>
		)
	}

}

