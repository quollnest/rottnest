import React from "react";
import RottnestContainer from "../container/RottnestContainer"


export interface WorkspaceProps {
	workspaceData: WorkspaceData
	key?: string
}

export interface Workspace extends React.Component {	
	props: WorkspaceProps
	workspaceObject?: boolean	
}

export interface WorkspaceGroup {
	MakeGroup(data: WorkspaceProps): Array<React.ReactElement>
}

export type WorkspaceData = {
	container: RottnestContainer
	key?: string
/*	toolKind: number
	zoomValue: number	
	designSpace: { 
		width: number 
		height: number 
	}
	selectedTab: number
	tabTitles: Array<string>
	subTypes: RottnestKindMap 
	availableTabs: Array<boolean>*/
}
