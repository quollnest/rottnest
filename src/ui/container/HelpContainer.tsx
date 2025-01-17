import React from "react";
import styles from '../styles/HelpContainer.module.css';

type HelpData = {
	toggleOff: () => void;
	helperData: Array<HelpBoxData>
}

export type HelpBoxData = {
	title: string
	content: string
	coords: [number, number]
	rightPointer?: boolean
}

class HelpBox extends React.Component<HelpBoxData, {}> {
	render() {
		const name = this.props.title;
		const content = this.props.content;
		const [x, y] = this.props.coords;
		const rightPObj = this.props.rightPointer;
		const pointerStyle = rightPObj !== undefined ?
			rightPObj === true ? 
			styles.helpPointer :
			styles.helpPointer :
			styles.helpPointer;

		return (
			<div className={styles.helpBox}
				style={{top: y, left: x}}>
				<span className={pointerStyle}
				style={{top: (y-14), left: (x-14)}}
					>
				</span>
				<header className={styles.helpBoxHeader}>
					{name}
				</header>
				<span className={styles.helpBoxContent}>
				{content}</span>
			</div>
		);
	}
}

export class HelpContainer extends React.Component<HelpData, {}> {


	render() {
		const toggleOff = this.props.toggleOff;

		const helpBoxes = this.props.helperData
			.map((hb, idx) => {
			return (<HelpBox key={idx} {...hb} />);
		});

		return (
			<div className={styles.helpEnabled}
				onClick={toggleOff}>
				{helpBoxes}
			</div>
		);
	}

}
