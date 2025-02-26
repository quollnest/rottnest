import { AppServiceClient } from "../../../net/AppService";

export type CommOperation<T> = {
  evkey: string
  evtrigger: (as: AppServiceClient, ctx: T, m: any) => void
}

export type CommEventOps<T> = {
  [key: string]: CommOperation<T>
}



export class CommsActions<T> {

  #eventops: CommEventOps<T> = {};

  constructor(ce: CommEventOps<T>) {
      this.#eventops = ce;
  }

  ApplyInternal(appService: AppServiceClient, rtc: T) {
     this.ApplyBindings(appService, rtc, this.#eventops);
  }
  
  ApplyBinding(appService: AppServiceClient, rtc: T, rtcopr: CommOperation<T>) {
    appService.registerReciverKinds(rtcopr.evkey, (m: any) => {
      rtcopr.evtrigger(appService, rtc, m);
    })
  }

  ApplyBindings(appService: AppServiceClient, rtc: T,
    commEvents: CommEventOps<T>) {
    for(const ce in commEvents) {
      this.ApplyBinding(appService, rtc, commEvents[ce]);
    }
  }
  
  static MakeCommsActions<T>() {
    return new CommsActions<T>({});
  }

  static MakeCommsWith<T>(commEvents: CommEventOps<T>) {
    return new CommsActions<T>(commEvents);
  }
  
}

