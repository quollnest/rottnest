import React from "react";
import {WorkspaceData} from "./workspace/Workspace";


type WidgetViewState = {
	data: any
}

export class WidgetSpace extends 
	React.Component<WorkspaceData, WidgetViewState> {
	
	render() {
		return (
			<div>
				This is the widget view tab
			</div>
		)
	}
}

