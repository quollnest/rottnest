import React from 'react';

import styles from '../styles/GridItem.module.css'

import {  
	ArrowUpOutlined,
	ArrowDownOutlined,
	ArrowLeftOutlined,
	ArrowRightOutlined
} from '@ant-design/icons'

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
	Detag: string
}



const GridStylesMap: StyleMap = {
	Bus: styles.Bus,
	Untagged: styles.Untagged,
	Register: styles.Register,
	BellState: styles.BellState,
	TFactory: styles.TFactory,
	Buffer: styles.Buffer,
	Detag: styles.Detag,
}

/**
 * CellData object that has a tag
 * currently outlined as a number but
 * should be referred to via an enum or
 * something more descriptive/robust
 */
class CellData {
	taggedKind: number = 0;
	neighbourDir: number = 0;

	constructor(tagNum: number) {
		this.taggedKind = tagNum;
	}

	setNeighbourDir(dir: number) {
		this.neighbourDir = dir;
	}

	toStyleKey() : keyof StyleMap {
		return CellData.GetStyleKey(this.taggedKind)
	}

	/**
	 * Retrieves the style key for the
	 * GridStyleMap
	 */
	static GetStyleKey(kind: number): keyof StyleMap {
		switch(kind) {
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
			case 6:
				return "Detag"
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
 * TODO: Clean up the type
 */
export type CellProps = {
	leftDown: boolean
	toolKind: number
	isHighlighted: boolean
	isSelected: boolean
	paintMode: boolean
	x: number
	y: number
	cell: { 
		taggedKind: number
		override: boolean
		cdir: number | null
	}
	tagFn?: (x: number, y: number) => void
	selectFn?: (x: number, y: number) => void
}



/**
 * Current GridCell object that forms part
 * of a large grid of object
 */
export class GridCell extends React.Component<CellProps, CellState> {
	
	state: CellState = { 
		data: new CellData(0),
	}

	/**
	 * Monitors the mouse movement after the left mouse button
	 * has been clicked
	 */
	cellMouseMove(_: React.MouseEvent<HTMLDivElement>, 
			tkind: number,
		     	leftDown: boolean) {

		const x = this.props.x;
		const y = this.props.y;
		
		if(leftDown) {	
			this.onTagging(x, y, tkind);
		}
	}

	cellMouseDown(_: React.MouseEvent<HTMLDivElement>,
			tkind: number) {
		const x = this.props.x;
		const y = this.props.y;
		
		this.onTagging(x, y, tkind);
	}


	onTagging(x: number, y: number, tkind: number) {
			
		const taggingFn = this.props.tagFn;
		const selectFn = this.props.selectFn;
		let newGCState = {...this.state};
		//Detects a change
		//TODO: Check if we need this if statement anymore
		if(tkind === 0) {
			if(selectFn) { selectFn(x, y); }

		} else if(newGCState.data.taggedKind != tkind) {
			if(taggingFn) {
				taggingFn(x, y);
			}
			if(this.props.paintMode) {
				newGCState.data.taggedKind = tkind;
			}
			this.setState(newGCState);
		}

	}

	getDirectionRender(cdir: number) {
		let arrowRender = <></>
		if(cdir === 1) {
			arrowRender = <ArrowUpOutlined />

		} else if(cdir === 2) {

			arrowRender = <ArrowRightOutlined />
		} else if(cdir === 3) {

			arrowRender = <ArrowLeftOutlined />
		} else if(cdir === 4) {

			arrowRender = <ArrowDownOutlined />
		}

		return arrowRender;
	}

	render() {

		const cref = this;


		const taggedKind = cref.props.cell.taggedKind;
		const cdir = cref.props.cell.cdir;

		const toolKind = cref.props.toolKind;
		const leftDown = cref.props.leftDown;
		
		const isSelected = cref.props.isSelected;
		
		const nCell = new CellData(taggedKind);
		const isHighlighted = cref.props.isHighlighted;

		const selectedStyle = isSelected ?
			`${CellData.GetStyleKey(toolKind)}Selected` :
			'';


		const mmove = (e: React.MouseEvent<HTMLDivElement>)=> {
			cref.cellMouseMove(e, toolKind, leftDown)
		}
		const mDown = (e: React.MouseEvent<HTMLDivElement>)=> {
			cref.cellMouseDown(e, toolKind)
			
		}
		//console.log(cdir);
		const pointer = cdir !== null ? 
			this.getDirectionRender(cdir) : <></>;
		
		const highlighted = !isHighlighted ? '' :
			styles.gridItemSelected;
		return (
			<div className={`${styles.gridItem} 
				${GridStylesMap[nCell.toStyleKey()]}
				${highlighted}
				${styles[selectedStyle] !==undefined ? 
					styles[selectedStyle] : ''}` }
				onMouseMove={mmove}
				onMouseDown={mDown}>
				{pointer}

				 
			</div>
		)
	}

}

