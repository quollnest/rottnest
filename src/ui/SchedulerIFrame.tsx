import {useRef} from 'react';
import style from './styles/SchedulerVisual.module.css'
import {WorkspaceData} from './workspace/Workspace';

export function SchedulerVisualiser(props: WorkspaceData) {
	
	
		
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const iframeObj = (
		<iframe src="https://jqxcz.github.io/scheduler_vis/"
		width={'100%'} height={"100%"} ref={iframeRef}>
		</iframe>);
	setTimeout(() => {

		iframeRef.current?.contentWindow?.postMessage(
			props.container.state
				.visData.payload, "*");
	}, 1000);

	return (
		<div className={style
			.schedulerVisualiser}>
			{iframeObj}
		</div>
	)
}

