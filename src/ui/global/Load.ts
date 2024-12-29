import RottnestContainer from "../container/RottnestContainer"


const leftClick = (_: RottnestContainer) => { }

const auxEvent = (_: RottnestContainer) => { }


export default { leftClick, auxEvent }

export const hiddenInputProc = (e: any, rott: RottnestContainer) => {
	const reader = new FileReader();
	let toLoad = e.target.files.item(0);
	
	reader.addEventListener('load', () => 
		{ rott.parseLoadedFile(reader.result); }, false);
	
	if(toLoad) {
		reader.readAsText(toLoad);
	}


}
