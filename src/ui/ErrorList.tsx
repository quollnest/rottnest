import React from "react";
import styles from './styles/ErrorList.module.css';

/**
 * The error data will provide a
 * description, name, identifier and reference related
 * to the region that is an issue
 *
 */
type ErrorData = {
	ident: number
	name: string
	itemRefKey: string
	description: string
}

/**
 * ErrorItemData is an aggregate
 * that will outline the data and selected
 * property for it to be highlighted
 */
type ErrorItemData = {
	errorData: ErrorData
	selected: boolean
	updateSelected: (idx: number) => void
}

/**
 * Properties that are held by the error list
 */
type ErrorListData = {
	selectedIndex: number
}

/**
 * ErrorListing that holds an aggregation
 * of an array of errors
 */
type ErrorListing = {
	errors: Array<ErrorData>
}

/**
 * An ErrorItem that will display and reference
 * an issue within the design space / project
 *
 */
class ErrorItem extends React.Component<ErrorItemData, {}> {


	render() {
		
		const ident = this.props.errorData.ident;
		const errorName = this.props.errorData.name;
		const isSelected = this.props.selected;
		const parentUpdateFn = this.props.updateSelected;	
		const updateFn = () => {
			parentUpdateFn(ident)
		}

		return (
			<li key={ident}
				className={ 
					isSelected ? 
					styles.errorItem :
					styles.selectedErrorItem 
				} 
				onClick={updateFn}>
				{errorName}
			</li>
		)
	}
}

/**
 * The ErrorList will display issues
 * within the project and design space
 */
class ErrorList extends React.Component<ErrorListing, ErrorListData> {
	state: ErrorListData = {
		selectedIndex: -1
	};

	/**
	 * Updates the selected index based on an on-click event
	 * in the error item
	 */
	updateSelected(idx: number) {
		this.state.selectedIndex = idx;
	}

	/**
	 * Renders a list of errors within a component
	 * the default styling will be applied
	 */
	render() {
		const headerName = 'Errors';

		const errors = this.props.errors.map(
			e => <ErrorItem errorData={e} 
					selected={e.ident === 
					this.state.selectedIndex }
					updateSelected={this.updateSelected}

				/>
		);
		return (
			<div className={styles.errorList}>
				<header className={styles.errorListHeader}>
					{headerName}</header>
			<ul>
				{errors}
			</ul>
			</div>
		)
	}

}

export default ErrorList;
