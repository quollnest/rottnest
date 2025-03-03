import { AppServiceClient } from "../../../net/AppService";

/**
 * CommOperation, type parameter is utilised
 * as a way to ensure the context is known and that registered
 * functions match expected
 */
export type CommOperation<T> = {
  evkey: string
  evtrigger: (as: AppServiceClient, ctx: T, m: any) => void
}

/**
 * Command event map, enforces the key is a string that maps
 * to a comm operation
 */
export type CommEventOps<T> = {
  [key: string]: CommOperation<T>
}


/**
 * CommsActions are a map of actions in which
 * the type parameter is expected to be the context
 * in which they are applied to.
 *
 * Example: Given a set of actions, we can apply an action
 * onto a UI Container like RottnestContainer or Workspace
 *
 */
export class CommsActions<T> {

  #eventops: CommEventOps<T> = {};

  constructor(ce: CommEventOps<T>) {
      this.#eventops = ce;
  }

  /**
   * Applies all the bindings by calling ApplyBindings
   * All registered event operations will be registered
   */
  ApplyInternal(appService: AppServiceClient, rtc: T) {
     this.ApplyBindings(appService, rtc, this.#eventops);
  }

  /**
   * Applies an individual binding to the given context
   */
  ApplyBinding(appService: AppServiceClient, rtc: T, rtcopr: CommOperation<T>) {
    appService.registerReciverKinds(rtcopr.evkey, (m: any) => {
      rtcopr.evtrigger(appService, rtc, m);
    })
  }

  /**
   * Applies all the bindings to a given context
   * All registered event operations will be registered
   */
  ApplyBindings(appService: AppServiceClient, rtc: T,
    commEvents: CommEventOps<T>) {
    for(const ce in commEvents) {
      this.ApplyBinding(appService, rtc, commEvents[ce]);
    }
  }

  /**
   * Creates a communcation object with a given context
   * kind associated. This has no event bindings
   */
  static MakeCommsActions<T>() {
    return new CommsActions<T>({});
  }

  /**
   * Constructs a communication object with event bindings
   * Newly constructed communication events are created
   * as they are passed as an argument here.
   */
  static MakeCommsWith<T>(commEvents: CommEventOps<T>) {
    return new CommsActions<T>(commEvents);
  }
  
}

