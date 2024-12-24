import React from 'react';
import { GridCell, CellProps } from './grid/GridItem.tsx'

import styles from './styles/DesignSpace.module.css'

/**
 * At the moment, nothing being used here
 */
type GridState = {}


/**
 * Outlines how many cells there is to be
 * created.
 */
type GridData = {
	width: number
	height: number
}

/**
 * DesignSpace will display the grid and have
 * a reference to regions that are placed on it.
 *
 */
class DesignSpace extends React.Component<GridData, GridState> {
	
	
	cells: Array<CellProps> = []
	
	render() {
		const renderableCells = 
			this.cells.map(c => <GridCell {...c} />);

		return (
			<div className={styles.designSpaceGrid}>
				{renderableCells}
			</div>
		)
	}

}

export default DesignSpace;
