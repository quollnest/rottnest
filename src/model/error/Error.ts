import RegionList from "../../ui/RegionList"


type ErrorPresentation = {
	erroPrefix: string
	errorCode: number
	description: string
	ruleKey: string
}

type ErrorValidation = {
	ruleKey: string
	apply: (regionList: RegionList) => boolean;
}


export class ValidationError {
	
}
