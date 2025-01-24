import {useRef} from 'react';
import style from './styles/SchedulerVisual.module.css'
import {WorkspaceData} from './workspace/Workspace';

export function SchedulerVisualiser(props: WorkspaceData) {
	
	function iframeLoaded() {
		iframeRef.current?.contentWindow?.postMessage(
			props.container.state
				.visData.payload.vis_obj, "*");
	}
		
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const iframeObj = (
		<iframe src="https://jqxcz.github.io/scheduler_vis/?file=none"
		width={'100%'} height={"100%"} ref={iframeRef} onLoad={iframeLoaded}>
		</iframe>);

	return (
		<div className={style
			.schedulerVisualiser}>
			{iframeObj}
		</div>
	)
}

