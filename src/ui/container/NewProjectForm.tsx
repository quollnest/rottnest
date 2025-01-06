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
type NewSettingsProps = {
	rootContainer: RottnestContainer
};


/**
 * Settings state, maintains the information
 * of the project unless otherwise refreshed
 * by the root container.
 */
type NewSettingsState = {
	project: ProjectDetails
}

/**
 * Settings form component, will be always present
 * in the display but turned off and on when needed
 */
class NewProjectForm extends React.Component<NewSettingsProps, 
	NewSettingsState> {
	
	rootContainer = this.props.rootContainer;

	//TODO: Fix the setting props on the width and height
	state: NewSettingsState = {
		project: {
			projectName: 'Project1', 
			author: 'User',
			width: 10,
			height: 20,
			description: 'Quick Description'	
		}
	};

	/**
	 * Cancels the component and triggers a re-render
	 * of the root container
	 */
	projectCancel() {
		this.rootContainer.cancelNewProject();
	}

	/**
	 * Saves the changes to the project
	 * root container will likely consider if it needs
	 * to flush the changes to other components
	 */
	projectApply() {
		this.rootContainer
			.applyNewProject(this
					 .state
					 .project);
	}


	render() {
		const sref = this;
		const inputChangeFn = (
			e: 
			React
			.FormEvent<HTMLInputElement>,
			key: 
			keyof ProjectDetails) => {

			let partial: 
			Partial<ProjectDetails> = {
				[key]: 
				e.currentTarget.value
			};

			let newState: 
				NewSettingsState = {
				...this.state, 
			};
			newState.project 
			= {...newState.project,
				...partial}

			sref.setState(newState);
		}

			

		return (
			<div className={styles.parentContainer} 
				style={{position:'relative'}}>
			<form className={styles.settingsForm}
				onSubmit={(e) => 
					e.preventDefault()}>
				<h2>New Project</h2>
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
				<input type="text" name="width"
					className={styles.inputMult}
					value={this.state
						.project.width} 
					onChange={(e) => 
						{inputChangeFn(e, 
						'width')}}/>x 
				<input type="text" name="height"
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
						.projectCancel()}
						type="button">
						Cancel
					</button>
					<button className={styles
						.settingsApply}
						onClick={(_) => 
						sref
						.projectApply()
						} type="submit">
						Apply
					</button>
				</div>
			</form>
			</div>
		);
	}
}

export default NewProjectForm;
