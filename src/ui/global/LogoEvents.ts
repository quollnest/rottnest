import RottnestContainer from "../container/RottnestContainer"

const leftClick = (r: RottnestContainer) => { 

	//FUN DEBUG MESSAGE
	const aps = r.commData
		.appService.sendObj('debug_send', 
		{
			testdata: 'glhf!'
		});

}

const auxEvent = (_: RottnestContainer) => { }


export default { leftClick, auxEvent }
