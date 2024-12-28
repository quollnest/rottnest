import RottnestContainer from "../container/RottnestContainer"


const leftClick = (rott: RottnestContainer) => {
	rott.undoRegion()
}

const auxEvent = (_: RottnestContainer) => { }


export default { leftClick, auxEvent }
