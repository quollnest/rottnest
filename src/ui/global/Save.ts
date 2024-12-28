
import RottnestContainer from "../container/RottnestContainer"

const leftClick = (rott: RottnestContainer) => {

	const blob = new Blob(['{ "test" : "t"}'], { type: 'application/json' });
	let uobj = URL.createObjectURL(blob, );
	
	let adown = document.createElement("a");
	adown.href = uobj;
	adown.download = 'project.json';
	adown.click();
	
}


const auxEvent = (_: RottnestContainer) => { }



export default { leftClick, auxEvent }
