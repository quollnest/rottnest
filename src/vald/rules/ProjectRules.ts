import { ProjectAssembly } from "../../model/Project";
import { ResultOk, ResultWarn, Rule, RuleResult } from "../Validator";

/**
 * Checks to see if a project name is not matching a length > 0
 */
const RuleProjectCheckName: Rule = {
  name: "ProjectNameCheck",
  code: "PN001",
  check: {
    apply: (assembly: ProjectAssembly): RuleResult => {
      return assembly.projectDetails.projectName.length > 0 ?
        ResultOk() : ResultWarn('P001', "Missing project name")
    }
    
  }
}

/**
 * Set of rules related to project details that can be applied
 */
const RuleSet: Array<Rule> = [
    RuleProjectCheckName
];

/**
 * Convention: Wrap it around a type
 * and call rules, however this can be violated
 *
 * Author's note: I kind of don't care, just update the Make
 * static method on the executor.
 */
export default class ProjectRules {
  static rules(): Array<Rule> {
    return RuleSet;
  }
}
