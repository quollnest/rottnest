import RottnestContainer from '../container/RottnestContainer';

const HelpEvent = {
  	leftClick: (container: RottnestContainer) => {
    		container.toggleHelp();
  	},
  	
	auxEvent: (_: RottnestContainer) => {
    		// No-op
  	}
}

export default HelpEvent;
