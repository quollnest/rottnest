import React from 'react';

import Help from './global/Help.ts';
import Load from './global/Load.ts';
import Save from './global/Save.ts';
import Undo from './global/Undo.ts';
import Redo from './global/Redo.ts';
import ZoomIn from './global/ZoomIn.ts';
import ZoomOut from './global/ZoomOut.ts';
import Settings from './global/Settings.ts';

import styles from './styles/GlobalBar.module.css';

/**
 * BarItemEvents, these are callbacks
 * that each baritem object will have associated
 */
type BarItemEvents = {
	leftClick: () => void
}

/**
 * BarItemData holds identifier, name
 * toolTip information and image reference
 */
type BarItemData = {
	id: number
	name: string
	toolTip: string
	image: string
	style?: string
	events: BarItemEvents
}


/**
 * BarItem, will have functionality and
 * description information associated with the top bar
 * of the screen.
 *
 * Image may be included (still deciding if it is a png or not)
 */
class BarItem extends React.Component<BarItemData, {}> {
	

	render() {
		const data = this.props; 
		const events = data.events;

		return (
			<li key={this.props.id}
				onClick={events.leftClick}
				className={data.style}
			>
				{this.props.name[0]}
			</li>
		)
	}
}

/**
 * GlobalBar object that will be set at the top of the
 * application.
 *
 * Different styling information will be associated with
 * BarItems
 *
 */
class GlobalBar extends React.Component<{}, {}> {
		
	barItems: Array<BarItemData> = [
		{ 
			id: 0,
			name: "ZoomIn", 
			toolTip: "Zoom In", 
			image: "MagnifyPlus",
			events: ZoomIn,
			style: styles.zoomIn
		},
		{ 
			id: 1, 
			name: "ZoomOut", 
			toolTip: "Zoom Out", 
			image: "MagnifyNegative",
			events: ZoomOut,
			style: styles.zoomOut
		},
		{ 
			id: 2, 
			name: "Undo", 
			toolTip: "Undo", 
			image: "UndoArrow",
			events: Undo,
			style: styles.undo
		},
		{ 
			id: 3, 
			name: "Redo", 
			toolTip: "Redo", 
			image: "RedoArrow",
			events: Redo,
			style: styles.redo
		},
		{ 
			id: 4, 
			name: "Settings", 
			toolTip: "Access Settings", 
			image: "SettingsImage",
			events: Settings,
			style: styles.settings
		},
		{ 
			id: 5, 
			name: "Save", 
			toolTip: "Save Project", 
			image: "SaveImage",
			events: Save,
			style: styles.save
		},
		{ 
			id: 6, 
			name: "Load", 
			toolTip: "Load", 
			image: "LoadImage",
			events: Load,
			style: styles.load
		},
		{ 
			id: 7, 
			name: "Help", 
			toolTip: "Access Help", 
			image: "HelpImage",
			events: Help,
			style: styles.help
		},
	];

	render() {

		const renderableBarItems = this.barItems.map(
			(bi: BarItemData) => <BarItem {...bi} />	
		);

		return (
			<div className={styles.globalBar}>
				{renderableBarItems}	
			</div>
		)

	}
}


export default GlobalBar;
