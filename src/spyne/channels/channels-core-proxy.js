import { ChannelsBase } from './channels-base';
import { Subject, ReplaySubject, merge } from 'rxjs';

export class ChannelsCoreProxy extends ChannelsBase {
  constructor(name, props = {}) {
    props.isProxy = true;
    super(name, props);
    this.props = props;
    this.subject$ = new Subject();
    this.replaySub$ = new ReplaySubject(1);
    this.observer$ = merge(this.subject$, this.replaySub$);
  }

  getMergedSubject(peristData = false) {
    return peristData === true ? this.replaySub$ : this.subject$;
  }

  get replaySubject() {
    return this.replaySub$;
  }

  get subject() {
    return this.subject$;
  }
}
