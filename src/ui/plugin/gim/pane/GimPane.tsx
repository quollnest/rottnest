import React from 'react';
import ErrorList from '../../../err/ErrorList.tsx';

import { Workspace, WorkspaceProps } from '../../../workspace/Workspace.tsx';
import { GimRulesBox } from './RulesBox.tsx';

import gimRules from '../styles/GimGraphRules.module.css'
import gimValidation from '../styles/GimValidation.module.css'

/**
 * Region Container that is a column container
 * that contains both region list and errors
 */
export class GimRulesContainer extends 
	React.Component<WorkspaceProps, {}> 
	implements Workspace {	
	render() {
		const container = this.props
			.workspaceData.container;
		return (
			<div 
				className={gimRules.rulesContainer}
				data-component="gim_rules_container"
				data-help-id="gim_rules_container"
				onMouseMove={
					(_) => {
						container.resetDSMove();
					}
				}
			>
				<GimRulesBox
				  header={"Rules"}
					container={container}
					data-component="gim_rules_panel"
					data-help-id="gim_rules_panel"
				/>
			</div>
		)
	}

}

/**
 * Region Container that is a column container
 * that contains both region list and errors
 */
export class GimValidationContainer 
	extends React.Component<WorkspaceProps, {}> 
	implements Workspace {	


	render() {

    const container = this.props.workspaceData.container;
	  
		return (
			<div
			  className={gimValidation.validationBox}
				data-component="gim_val_container"
				data-help-id="gim_val_container"
				onMouseMove={
					(_) => {}
				}
			>
			<ErrorList rtc={container} errors={[]}
					data-component="error_list"
					data-help-id="error_list"
					/>
			</div>
		)

	}
}


