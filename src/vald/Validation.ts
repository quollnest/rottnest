import { ProjectAssembly } from "../model/Project";
import ProjectRules from "./rules/ProjectRules";
import { EnforcementTuple, LocalValidator, RemoteValidator } from "./Validator";

/**
 * ValidationExecutor
 * Used to execute both local and remote validation rules on the
 * project assembly.
 */
export class ValidationExecutor {

  #localValidator: LocalValidator = new LocalValidator();
  #remoteValidator: RemoteValidator = new RemoteValidator();

  /**
   * Constructs a validation executor and registers the basic
   * rules.
   */
  static Make(): ValidationExecutor {
    const vexec = new ValidationExecutor();
    vexec.#localValidator.registerRules(ProjectRules.rules());
    
    return vexec;
  }

  /**
   * Will apply a set of local rules on the current project
   * assembly.
   */
  localOnly(assembly: ProjectAssembly): EnforcementTuple {
    return this.#localValidator.applyOn(assembly);
  }

  /**
   * Will apply the remote rules on the architecture object
   * TODO: Not implemented fully yet
   */
  remoteOnly(): boolean {
    return false;
  }
  
}
