import React from 'react';
import style from '../styles/SelectionVisual.module.css';
import {DesignSpace} from '../DesignSpace';

//TODO: coordsRef is no longer used
type SelectionProps = {
	container: DesignSpace
	coordsRef: {
		x1: number
		x2: number
		y1: number
		y2: number
	}
}

export default class SelectionVisual 
	extends React.Component<SelectionProps, {}> {
	
	render() {

		const props = this.props;
		
		const { x1, x2, y1, y2 } = props.container
			.getSelectionData();
		
		const sx = x1 < x2 ? x1 : x2;
		const sy = y1 < y2 ? y1 : y2;
		const ex = x1 < x2 ? x2 : x1;
		const ey = y1 < y2 ? y2 : y1;

		const width = ex - sx;
		const height = ey - sy;

		const sref = this.props.container;

		const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
			sref.selectionMoveRel(e.movementX,
					e.movementY);
		}

		const onUp = (_: React.MouseEvent<HTMLDivElement>) => {
			sref.onSelectFinish();
		}


		return (
			<div 
			className={style.selectionVisual}
			style={ {
				top: sy,
				left: sx,
				width: width >= 3 ? width-3 : width,
				height: height >= 3 ? height-3 : height,	 
				
				visibility: props.container.state
					.leftIsDown ? 'visible' 
						: 'hidden'
			} }
			onMouseMove={onMove}
			onMouseUp={onUp}>

			</div>
		)
	}


}

