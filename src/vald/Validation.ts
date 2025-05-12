import { ProjectAssembly } from "../model/Project";
import ProjectRules from "./rules/ProjectRules";
import { EnforcementTuple, LocalValidator, RemoteValidator } from "./Validator";

export type ValidationBuffers = {
  localbuf: EnforcementTuple
  remotebuf: EnforcementTuple
}


/**
 * ValidationExecutor
 * Used to execute both local and remote validation rules on the
 * project assembly.
 */
export class ValidationExecutor {

  validationbuffers: ValidationBuffers = ValidationExecutor.EmptyBuffers();
  #localValidator: LocalValidator = new LocalValidator();
  #remoteValidator: RemoteValidator = new RemoteValidator();

  static EmptyBuffers(): ValidationBuffers {
    return {
      localbuf: [true, []],
      remotebuf: [true, []]
    }
  }

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
    const localres = this.#localValidator.applyOn(assembly);
    this.validationbuffers.localbuf = localres;
    return localres;
  }

  /**
   * Will apply the remote rules on the architecture object
   * TODO: Not implemented fully yet
   */
  remoteOnly(assembly: ProjectAssembly): EnforcementTuple {
    
    const localres = this.#remoteValidator.applyOn(assembly);
    this.validationbuffers.localbuf = localres;
    return localres;
  }

  /**
   * Gets the latest results after a run
   * The buffer will contain results after validation has occured
   */
  getBuffers(): ValidationBuffers {
    return this.validationbuffers;
  }

  
}
