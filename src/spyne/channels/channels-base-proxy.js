import {ChannelsBase} from './channels-base';
import {ChannelStreamItem} from './channel-stream-item';
import {Subject, ReplaySubject, merge, Observable, from} from "rxjs";
import {flatMap, map, multicast} from "rxjs/operators";

export class ChannelsBaseProxy extends ChannelsBase {
  constructor(name, props = {}) {
    props.isProxy = true;
    super(name, props);
    this.props = props;
    this.subject$ = new Subject();
    this.replaySub$ = new ReplaySubject(1);
    this.observer$ = merge(this.subject$, this.replaySub$);
  }

  getMergedSubject(peristData=false){
    return peristData === true ? this.replaySub$ : this.subject$;
  }

  get replaySubject(){
    return this.replaySub$;
  }

  get subject(){
    return this.subject$;
  }



}
