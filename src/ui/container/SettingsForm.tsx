import React from 'react';
import {ProjectDetails} from '../../model/Project';
import styles from '../styles/SettingsForm.module.css';
import RottnestContainer from './RottnestContainer';

/**
 * Settings Properties, initialises
 * as hidden and provide a connection to the
 * root container that it can connect to.
 *
 * Warning: We have coupled this component
 * 	to the root container.
 */
type SettingsProps = {
	isHidden: boolean
	rootContainer: RottnestContainer
	projectDetails: ProjectDetails
};


/**
 * Settings state, maintains the information
 * of the project unless otherwise refreshed
 * by the root container.
 */
type SettingsState = {
	project: ProjectDetails
}

/**
 * Settings form component, will be always present
 * in the display but turned off and on when needed
 */
class SettingsForm extends React.Component<SettingsProps, 
	SettingsState> {
	
	rootContainer = this.props.rootContainer;

	//TODO: Fix the setting props on the width and height
	state: SettingsState = {
		project: {
			projectName: 'Project1', 
			author: 'User',
			width: 20,
			height: 20,
			description: 'Quick Description'	
		}
	};

	/**
	 * Cancels the component and triggers a re-render
	 * of the root container
	 */
	cancel() {
		this.rootContainer.cancelSettings();
	}

	/**
	 * Saves the changes to the project
	 * root container will likely consider if it needs
	 * to flush the changes to other components
	 */
	settingsApply() {
		this.rootContainer
			.applySettings(this.state.project);
	}


	render() {
		const sref = this;
		const hidden = this.props.isHidden;
		const inputChangeFn = (
			e: React.FormEvent<HTMLInputElement>,
				key: keyof ProjectDetails) => {

			let partial: Partial<ProjectDetails> = {
				[key]: e.currentTarget.value
			};

			let newState: SettingsState = {
				...this.state, 
			};
			newState.project = {...newState.project,
				...partial}

			sref.setState(newState);
		}

			

		return (
			<div className={styles.parentContainer} 
				style={{position:'relative',
				visibility: hidden ?
					"hidden" : "visible"
				}}>
			<form className={styles.settingsForm}
				onSubmit={(e) => 
					e.preventDefault()}>
				<h2>Settings</h2>
				<label>Project Name</label>
				<input type="text" name="projectName"
					value={this.state
						.project
						.projectName} 
					onChange={(e) => {
						inputChangeFn(e, 
						'projectName')}}/>
					<br />
				<label>Author</label>
				<input type="text" name="author"
					value={this.state
						.project.author} 
					onChange={(e) => 
						{inputChangeFn(e, 
						'author')}}/>
				<label>Width & Height</label>
				<input type="number" name="width"
					className={styles.inputMult}
					value={this.state
						.project.width} 
					onChange={(e) => 
						{inputChangeFn(e, 
						'width')}}/>x 
				<input type="number" name="height"
					className={styles
						.inputMult}	
					value={this.state
						.project.height} 
					onChange={(e) => 
						{inputChangeFn(e, 
						'height')}}/>

				
				<label>Short Description</label>
				<input type="text" name="description"
					value={this.state
						.project
						.description} 
					onChange={(e) => 
						{inputChangeFn(e, 
						'description')}}/>
				
				<div className={styles
					.buttonSegment}>
					<button className={styles
						.settingsCancel}
						onClick={(_) => 
							sref
							.cancel()}
						type="button">
						Cancel
					</button>
					<button className={styles
						.settingsApply}
						onClick={(_) => 
						sref
						.settingsApply()
						} type="submit">
						Apply
					</button>
				</div>
			</form>
			</div>
		);
	}
}

export default SettingsForm;
