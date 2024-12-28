import React from 'react';
import styles from './styles/ToolboxOptions.module.css';


/**
 * ToolboxProps is designed to
 * set some defaults as well as any events
 * that require the container to have a trigger for
 *
 */
type ToolboxOptionsProps = {
	headerName: string
	toolKind: number
}


/**
 * ToolboxState are fields that
 * require updating and also triggering
 * a re-render of the toolbox when
 * an event occurs
 *
 */
type ToolboxOptionsState = {
	selectedToolIndex: number
}

/**
 * Designed to hold the current set of
 * tools and monitor the current event
 * states
 *
 * Responsible for also updating its parent
 * container of any side effect changes
 * that a new selection may trigger
 */
class ToolboxOptions extends React.Component<ToolboxOptionsProps, ToolboxOptionsState> {
	
	state: ToolboxOptionsState = {
		selectedToolIndex: 0,
	}

	render() {

		const headerName = 'Options';

		return (
			<div className={styles.toolboxOptions}>
				<header className={styles.toolboxOptionsHeader}>
					{headerName}</header>
			</div>
		)
	}

}

export default ToolboxOptions;
