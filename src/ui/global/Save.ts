import RottnestProject from "../../model/Project"

const leftClick = (rott: RottnestProject) => {
	const blob = new Blob(['{ "test" : "t"}'], { type: 'application/json' });
	let uobj = URL.createObjectURL(blob, );
	
	let adown = document.createElement("a");
	adown.href = uobj;
	adown.download = 'project.json';
	adown.click();
	
}


export default { leftClick }
