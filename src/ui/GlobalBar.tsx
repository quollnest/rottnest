import React, {ReactElement} from 'react';

import HelpEvent from './global/Help.ts';
import LoadEvent, { hiddenInputProc } from './global/Load.ts';
import SaveEvent from './global/Save.ts';
import UndoEvent from './global/Undo.ts';
import RedoEvent from './global/Redo.ts';
import ZoomInEvent from './global/ZoomIn.ts';
import ZoomOutEvent from './global/ZoomOut.ts';
import SettingsEvent from './global/Settings.ts';
import NewProjectEvent from './global/NewProject.ts';
import RunEvents from './global/Run.ts';
import ReconnectEvent from './global/ReconnectEvent.ts';
import NullEvents from './global/NullEvents.ts';

import {  
	SaveOutlined,
	UploadOutlined,
	ZoomInOutlined,
	ZoomOutOutlined,
	UndoOutlined,
	RedoOutlined,
	SettingOutlined,
	FlagOutlined,
	PlusSquareOutlined,
	PlaySquareOutlined,
	RollbackOutlined
} from '@ant-design/icons'

import styles from './styles/GlobalBar.module.css';
import RottnestContainer from './container/RottnestContainer.tsx';
import {ProjectDetails} from '../model/Project.ts';
import LogoEvents from './global/LogoEvents.ts';


/**
 * GlobalBarProps, has a reference to
 * its container and a component map of values
 * which are a little more dynamic
 */
type GlobalBarProps = {
	container: RottnestContainer
	componentMap: Map<number, [string, 
		ProjectDetails]>
}

/**
 * BarItemEvents, these are callbacks
 * that each baritem object will have associated
 */
type BarItemEvents = {
	leftClick: (project: RottnestContainer) => void
	auxEvent: (project: RottnestContainer) => void
}

/**
 * BarItemDescription holds identifier, name
 * toolTip information and image reference
 */
type BarItemDescription = {
	id: number
	name: string
	toolTip: string
	image: string
	style?: string
	events: BarItemEvents
	iconComponent: ReactElement
}

/**
 * BarItemData properties that is given
 * from the design space
 */
type BarItemData = {
	containerRef: RottnestContainer
	description: BarItemDescription
	updatable?: [string, ProjectDetails]
}


/**
 * Improved BarItem component with better styling
 * and responsiveness
 */
const BarItem: React.FC<BarItemData> = (props) => {
	const { containerRef, description, updatable } = props;
	const val = updatable ? updatable[0] : '';
	const events = description.events;
	const ico = description.iconComponent;
	const name = description.name;
	const ident = description.id;
	const tooltip = description.toolTip;
	
	return (
		<li 
			key={ident}
			onClick={() => events.leftClick(containerRef)}
			className={`${styles.barItem} ${description.style || ''}`}
			title={tooltip}
		>
			<div className={styles.barItemContent}>
				<span className={styles.barItemIcon}>{ico}</span>
				{(val || name) && (
					<span className={styles.barItemText}>{val || name}</span>
				)}
			</div>
		</li>
	);
};

/**
 * GlobalBar object that will be set at the top of the
 * application.
 */
class GlobalBar extends React.Component<GlobalBarProps, {}> {
		
	barItems: Array<BarItemDescription> = [
		{ 
			id: 200,
			name: "", 
			toolTip: "Logo", 
			image: "",
			events: LogoEvents,
			style: styles.containerLogo,
			iconComponent: <div>Test Build</div>
		},
		{ 
			id: 0,
			name: "", 
			toolTip: "Zoom In", 
			image: "MagnifyPlus",
			events: ZoomInEvent,
			style: styles.zoomIn,
			iconComponent: <ZoomInOutlined />
		},
		{ 
			id: 100, 
			name: "", 
			toolTip: "Zoom Value", 
			image: "",
			events: NullEvents,
			style: styles.zoomValue,
			iconComponent: <></>,
		},
		{ 
			id: 1, 
			name: "", 
			toolTip: "Zoom Out", 
			image: "MagnifyNegative",
			events: ZoomOutEvent,
			style: styles.zoomOut,
			iconComponent: <ZoomOutOutlined />
		},
		{ 
			id: 2, 
			name: "Undo", 
			toolTip: "Undo", 
			image: "UndoArrow",
			events: UndoEvent,
			style: styles.undo,
			iconComponent: <UndoOutlined />
		},
		{ 
			id: 3, 
			name: "Redo", 
			toolTip: "Redo", 
			image: "RedoArrow",
			events: RedoEvent,
			style: styles.redo,
			iconComponent: <RedoOutlined />
		},
		{ 
			id: 10, 
			name: "", 
			toolTip: "", 
			image: "missing",
			events: NullEvents,
			style: styles.separator,
			iconComponent: <></>
		},
		{ 
			id: 200, 
			name: "Reconnect", 
			toolTip: "Reconnect to API", 
			image: "HelpImage",
			events: ReconnectEvent,
			style: styles.reconnect,
			iconComponent: <RollbackOutlined />
		},
		{ 
			id: 10, 
			name: "Run", 
			toolTip: "Run App (Experiment)", 
			image: "Run",
			events: RunEvents,
			style: styles.run,
			iconComponent: <PlaySquareOutlined />
		},
		{ 
			id: 4, 
			name: "Save", 
			toolTip: "Save Project", 
			image: "SaveImage",
			events: SaveEvent,
			style: styles.save,
			iconComponent: <SaveOutlined />
		},
		{ 
			id: 5, 
			name: "Load", 
			toolTip: "Load", 
			image: "LoadImage",
			events: LoadEvent,
			style: styles.load,
			iconComponent: 
				<>
				<UploadOutlined />
				<input className={styles.hiddenFile} 
					type="file" 
					onChange={(e) => {
						hiddenInputProc(e, containerRef);
					}} />
				</>
		},
		{ 
			id: 8, 
			name: "New", 
			toolTip: "New Project", 
			image: "NewProjectImage",
			events: NewProjectEvent,
			style: styles.newProject,
			iconComponent: <PlusSquareOutlined />
		},
		{ 
			id: 6, 
			name: "Settings", 
			toolTip: "Access Settings", 
			image: "SettingsImage",
			events: SettingsEvent,
			style: styles.settings,
			iconComponent: <SettingOutlined />
		},
		{ 
			id: 7, 
			name: "Help", 
			toolTip: "Access Help", 
			image: "HelpImage",
			events: HelpEvent,
			style: styles.help,
			iconComponent: <FlagOutlined />
		},
	];

	render() {
		const { componentMap, container } = this.props;

		return (
			<div 
				className={styles.globalBar}
				onMouseMove={() => container.resetDSMove()}
			>
				<ul className={styles.barItemList}>
					{this.barItems.map((item, idx) => (
						<BarItem 
							key={idx}
							containerRef={container}
							description={item}
							updatable={componentMap.get(item.id)}
						/>
					))}
				</ul>
			</div>
		);
	}
}

export default GlobalBar;
