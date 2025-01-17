import RottnestContainer from "../container/RottnestContainer"


const leftClick = (rott: RottnestContainer) => {	
	rott.toggleHelp();
}

const auxEvent = (_: RottnestContainer) => {


}


export default { leftClick, auxEvent }
