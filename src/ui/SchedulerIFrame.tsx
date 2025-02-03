import {useRef} from 'react';
import style from './styles/SchedulerVisual.module.css'
import {WorkspaceData} from './workspace/Workspace';

export function SchedulerVisualiser(props: WorkspaceData) {
	const bmap = props.bufferMap;
	const vizDataStr = bmap.get('current_viz_data');
	const vizData = JSON.parse(vizDataStr);
	function iframeLoaded() {
		iframeRef.current?.contentWindow?.postMessage(
			vizData.vis_obj, "*");
	}
		
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const iframeObj = (
		<iframe src="https://jqxcz.github.io/scheduler_vis/?file=none"
		width={'100%'} height={"95%"} ref={iframeRef} onLoad={iframeLoaded}>
		</iframe>);

	return (
		<div className={style
			.schedulerVisualiser}>
			{iframeObj}
		</div>
	)
}

