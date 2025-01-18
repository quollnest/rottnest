/*import React from 'react';
import style from '../styles/HighlightedRegion.module.css';
import {DesignSpace} from '../DesignSpace';

//TODO: coordsRef is no longer used
type RegionSelectionProps = {
	coordsRef: {
		x1: number
		x2: number
		y1: number
		y2: number
	}
}

export default class HighlightedRegion 
	extends React.Component<RegionSelectionProps, {}> {
	
	render() {

		const props = this.props;
		
		const { x1, x2, y1, y2 } = props.coordsRef;
		
		const sx = x1 < x2 ? x1 : x2;
		const sy = y1 < y2 ? y1 : y2;
		const ex = x1 < x2 ? x2 : x1;
		const ey = y1 < y2 ? y2 : y1;

		const width = ex - sx;
		const height = ey - sy;

		return (
			<div 
			className={style.highlightedRegion}
			style={ {
				top: sy,
				left: sx,
				width: width,
				height: height,	 
			} }>

			</div>
		)
	}


}
*/
