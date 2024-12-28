import RottnestContainer from "../container/RottnestContainer"


const leftClick = (rott: RottnestContainer) => {
	rott.showSettings();
}

const auxEvent = (_: RottnestContainer) => { }

export default { leftClick, auxEvent }
