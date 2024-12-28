import RottnestContainer from "../container/RottnestContainer"


const leftClick = (rott: RottnestContainer) => {
	rott.zoomOut(25);
}

const auxEvent = (_: RottnestContainer) => { }


export default { leftClick, auxEvent }
