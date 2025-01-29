import React from 'react';
import styles from '../styles/ErrorDisplay.module.css';
import RottnestContainer from './RottnestContainer';

/**
 * Settings Properties, initialises
 * as hidden and provide a connection to the
 * root container that it can connect to.
 *
 * Warning: We have coupled this component
 * 	to the root container.
 */
type ErrorProps = {
	message: string
	rootContainer: RottnestContainer
};


/**
 * Settings form component, will be always present
 * in the display but turned off and on when needed
 */
class ErrorDisplay extends React.Component<ErrorProps, {}> {
	
	rootContainer = this.props.rootContainer;

	clearError() {
		this.rootContainer.closeError();
	}

	render() {
					
		const msg = this.props.message;
		const msgSpl = msg.split("\n").map((e) => {
			return <pre className={styles.preFormatDump}>{e}</pre>
		});
		console.log(msgSpl);
		return (
			<div className={styles.errorDisplay} 
				style={{position:'absolute'}}>
				<header className={styles.errorHeader}>An issue occurred</header>
				<div>
				Either a message from the backend
				or an event did not trigger correctly.
				</div>
				<div>JSON Dump: </div>
				<div className={styles.preFormatDump}>{msgSpl}</div>
				<button onClick={() => {this.clearError() }}
				className={styles.errorButton}>
				Got it
				</button>
			</div>
		);
	}
}

export default ErrorDisplay;
