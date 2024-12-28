import RottnestContainer from "../container/RottnestContainer"


const leftClick = (rott: RottnestContainer) => {
	rott.redoRegion();
}

const auxEvent = (_: RottnestContainer) => {}


export default { leftClick, auxEvent }
