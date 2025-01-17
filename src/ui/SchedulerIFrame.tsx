import React, {useRef} from 'react';
import {TSchedData} from '../model/TSchedData';
import style from './styles/SchedulerVisual.module.css'

type SchedulerVisualiserProps = {
	visData: any
}




export function SchedulerVisualiser(props: SchedulerVisualiserProps) {
	
		
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const iframeObj = (<iframe src="https://jqxcz.github.io/scheduler_vis/"
				width={'100%'} height={"100%"} ref={iframeRef}>
				</iframe>);
	console.log(props.visData.payload);
	setTimeout(() => {

		iframeRef.current?.contentWindow?.postMessage(props.visData.payload, "*");
	}, 1000);

	return (
		<div className={style.schedulerVisualiser}>
			{iframeObj}
		</div>
	)
}

