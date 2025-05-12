import { AppServiceClient } from "../../../net/AppService";

export type CommDispatch<T> = {
  opkey: string
  operation: (as: AppServiceClient, ctx: T) => void
}

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


export class CommOpQueue<T> {
  #queue: Array<CommDispatch<T>> = [];

  /**
   * Adds a dispatch method to the queue
   */
  push(op: CommDispatch<T>) {
    this.#queue.push(op);
  }

  /**
   * Adds a list of dispatch methods to the queue
   */
  pushMany(ops: Array<CommDispatch<T>>) {
    this.#queue.push(...ops);
  }

  /**
   * Triggers the operation of all the dispatch methods in the queue
   */
  applyAll(aps: AppServiceClient, ctx: T) {
    for(const op of this.#queue) {
      op.operation(aps, ctx);
    }
  }

  /**
   * Applies the first dispatch method and removes it 
   */
  applyThenDequeue(aps: AppServiceClient, ctx: T) {
    const op = this.#queue.shift();
    if(op) {
      op.operation(aps, ctx);
    }
  }

  /**
   *
   */
  static MakeDispatchWith<T>(ops: Array<CommDispatch<T>>) {
    const dispatcher: CommOpQueue<T> = new CommOpQueue();
    dispatcher.pushMany(ops);
    return dispatcher;
  }
   
}
