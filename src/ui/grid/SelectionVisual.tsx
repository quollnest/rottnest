import React from 'react';
import style from '../styles/SelectionVisual.module.css';
import {DesignSpace} from '../DesignSpace';

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
			sref.selectionMove(e.clientX,
					e.clientY);
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
				width: width >= 5 ? width-5 : width,
				height: height >= 5 ? height-5 : height,	 
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

