import RottnestContainer from "../container/RottnestContainer"


const leftClick = (rott: RottnestContainer) => {
	rott.showNewProject();
}

const auxEvent = (_: RottnestContainer) => { }

export default { leftClick, auxEvent }
