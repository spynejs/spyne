import {ChannelsBase} from '../channels/channels-base';
const R = require('ramda');
const Rx = require('rxjs');

export class ChannelUI extends ChannelsBase {
  constructor() {
    super();
    this.props.name = 'UI';
    this.keyEventsLoaded = false;
    this.keyCodeArr = [];
    // this.addKeyEvent(13);
  }

  addRegisteredActions() {
    return [
      'CHANNEL_UI_EVENT',
      'CHANNEL_UI_BLUR_EVENT',
      'CHANNEL_UI_CLICK_EVENT',
      'CHANNEL_UI_CHANGE_EVENT',
      'CHANNEL_UI_CHANGE_EVENT',
      'CHANNEL_UI_DBLCLICK_EVENT',
      'CHANNEL_UI_FOCUS_EVENT',
      'CHANNEL_UI_FOCUSIN_EVENT',
      'CHANNEL_UI_FOCUSOUT_EVENT',
      'CHANNEL_UI_INPUT_EVENT',
      'CHANNEL_UI_KEYDOWN_EVENT',
      'CHANNEL_UI_KEYPRESS_EVENT',
      'CHANNEL_UI_KEYUP_EVENT',
      'CHANNEL_UI_MOUSEDOWN_EVENT',
      'CHANNEL_UI_MOUSEENTER_EVENT',
      'CHANNEL_UI_MOUSELEAVE_EVENT',
      'CHANNEL_UI_MOUSEMOVE_EVENT',
      'CHANNEL_UI_MOUSEOUT_EVENT',
      'CHANNEL_UI_MOUSEOVER_EVENT',
      'CHANNEL_UI_MOUSEUP_EVENT',
      'CHANNEL_UI_SELECT_EVENT'
    ];
  }

  loadKeyStream() {
    let keyUps = Rx.Observable.fromEvent(document, 'keyup');
    let filterKeys = e => this.keyCodeArr.indexOf(e.keyCode) >= 0;
    this.keyPresses$ = keyUps.groupBy(e => e.keyCode)
      .mergeAll()
      .filter(filterKeys)
      .repeat()
      .subscribe(this.onKeyPressed.bind(this));
  }

  addKeyEvent(num) {
    if (this.keyEventsLoaded === false) {
      this.loadKeyStream();
    }
    this.keyEventsLoaded = true;
    this.registerKey(num);
  }

  registerKey(c) {
    this.keyCodeArr.push(c);
  }

  onKeyPressed(evt) {
    console.log('key is ', evt);
  }

  onIncomingObservable(obj) {
    let eqsName = R.equals(obj.name, this.props.name);
    let dataObj = obsVal => ({observableData: obj.data, uiEvent: obsVal});
    let onSuccess = (obj) => obj.observable.map(dataObj)
      .subscribe(this.onUIEvent.bind(this));
    let onError = () => {};
    return eqsName === true ? onSuccess(obj) : onError();
  }

  getActionState(val) {
    let typeVal = R.path(['uiEvent', 'type']);
    let typeOverRideVal = R.path(['uiEvent','typeOverRide']);
    let eventType = R.compose(R.toUpper, R.either(typeOverRideVal, typeVal));
    let type = eventType(val);
    let mainAction = 'CHANNEL_UI';
    return type !== undefined ? `${mainAction}_${type}_EVENT` : mainAction;
  }

  onUIEvent(obs) {
    obs['action'] = this.getActionState(obs);
    const action = obs.action;// this.getActionState(obs);
    const {payload, srcElement} = obs.observableData;
    const event = obs.uiEvent;
    this.sendStreamItem(action, payload, srcElement, event);
  }
}
