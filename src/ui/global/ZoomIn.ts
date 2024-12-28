import RottnestContainer from "../container/RottnestContainer"


const leftClick = (rott: RottnestContainer) => {
	rott.zoomIn(25);
}

const auxEvent = (_: RottnestContainer) => { }


export default { leftClick, auxEvent }
