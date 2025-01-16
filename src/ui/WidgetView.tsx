import React from "react";
import {TSchedData} from "../model/TSchedData";



type WidgetViewData = {
}

type WidgetViewState = {
	data: any
}

export class WidgetView extends React.Component<WidgetViewData, WidgetViewState> {
	
	render() {
		return (
			<div>
				This is the widget view tab
			</div>
		)
	}
}

