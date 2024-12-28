import React from 'react';
import styles from '../styles/GridItem.module.css'

/**
 * StyleMap type that will
 * hold onto style classes used in
 * computing the css
 */
type StyleMap = {
	Bus: string 
	Untagged: string 
	Register: string 
	BellState: string	
	TFactory: string
	Buffer: string
}

const GridStylesMap: StyleMap = {
	Bus: styles.Bus,
	Untagged: styles.Untagged,
	Register: styles.Register,
	BellState: styles.BellState,
	TFactory: styles.TFactory,
	Buffer: styles.Buffer,
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
	
	/**
	 * Retrieves the style key for the
	 * GridStyleMap
	 */
	toStyleKey(): keyof StyleMap {
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
 * CellState information,
 * holds onto celldata, mostly focused on
 * holding the taggedKind value
 */
type CellState = {
	data: CellData
}


/**
 * Passes down properties related to the current
 * cell along with update functionality for where
 * the celldata is actually stored
 */
export type CellProps = {
	leftDown: boolean
	toolKind: number
	x: number
	y: number
	cell: {
		taggedKind: number
	}
	tagFn?: (x: number, y: number) => void
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

	/**
	 * Monitors the mouse movement after the left mouse button
	 * has been clicked
	 */
	cellMouseMove(_: React.MouseEvent<HTMLDivElement>, tkind: number,
		     leftDown: boolean) {
		const taggingFn = this.props.tagFn;
		const x = this.props.x;
		const y = this.props.y;
		if(leftDown) {	
			let newGCState = {...this.state};
			
			//Detects a change
			if(newGCState.data.taggedKind != tkind) {
				if(taggingFn) {
					taggingFn(x, y);	
				}
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
		
		const mmove = (e: React.MouseEvent<HTMLDivElement>) => {
			cref.cellMouseMove(e, toolKind, leftDown)
		}
		
		return (
			<div className={`${styles.gridItem} 
				${GridStylesMap[cdata.toStyleKey()]}` }
				onMouseMove={mmove}>
				 
			</div>
		)
	}

}

