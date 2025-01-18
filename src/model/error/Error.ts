import RegionList from "../../ui/RegionList"


export type ErrorPresentation = {
	erroPrefix: string
	errorCode: number
	description: string
	ruleKey: string
}

export type ErrorValidation = {
	ruleKey: string
	apply: (regionList: RegionList) => boolean;
}


export class ValidationError {
	
}
