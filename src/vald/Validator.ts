import { ProjectAssembly } from "../model/Project";

type RuleResultKind = "Ok" | "Warning" | "Error";

export type RuleResult = {
  kind: RuleResultKind
  code: string
  msg: string
}

export function ResultOk(): RuleResult {
  return {
    kind: "Ok",
    code: "",
    msg: ''
  }
}

export function ResultWarn(code: string, msg: string): RuleResult {
  return {
    kind: "Warning",
    msg,
    code
  }
}

export function ResultErr(code: string, msg: string): RuleResult {
  return {
    kind: "Error",
    msg,
    code
  }
}

/**
 * Used to show that if the result has passed with all ok or warnings
 * or it at least 1 error exists
 */
export type EnforcementTuple = [boolean, Array<RuleResult>];

/**
 * Contains a rule object that is represented
 * and can be applied.
 * Check field will call an object that will 
 *
 */
export type Rule = {
  name: string
  code: string
  check: RuleOp
}

/**
 * Rule operation, will be used to apply on the assembly
 * and validate if a rule has been applied or not
 */
export interface RuleOp {
  apply(assembly: ProjectAssembly): RuleResult
}


/**
 * Validator type is used to invoke a set of rules that it has bindings
 * bindings to.
 * 
 */
export class LocalValidator {

  rules: Map<string, Rule> = new Map();    

  /**
   * Registers a rule object to the local validator
   */
  registerRule(rule: Rule) {
    this.rules.set(rule.name, rule);
  }

  /**
   * Registers a batch of rules at once
   */
  registerRules(rules: Array<Rule>) {
    for(const r of rules) {
      this.registerRule(r);
    }
  }

  /**
   * Runs through all the locally registered rules
   * Applies them to the assembly given and returns a rule result
   * If no rules are broken or at least, no errors broken, it will
   * report that it is okay.
   * Warnings will be listed regardless
   */
  applyOn(assembly: ProjectAssembly): EnforcementTuple {
    let results: Array<RuleResult> = [];
    let errCount = 0;

    for(const [_k, rule] of this.rules.entries()) {
      const res = rule.check.apply(assembly);
      if(res.kind !== "Ok") {
        results.push(res);
      }
      if(res.kind === "Error") {
        errCount++;
      }
    }

    return [errCount === 0, results];
  }
  
  
}

/**
 * Validator that receives it from an external object (over the network)
 * It will be used by the 
 */
export class RemoteValidator {

  applyOn(_assembly: ProjectAssembly): EnforcementTuple {
    return [true, []];
  }
  
  
}
