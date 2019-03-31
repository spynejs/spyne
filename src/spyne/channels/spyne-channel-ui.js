import { ChannelBaseClass } from './channel-base-class';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {equals, path, compose,prop, pathEq, when, either, toUpper} from 'ramda';

export class SpyneChannelUI extends ChannelBaseClass {
  /**
   * @module SpyneChannelUI
   * @desc
   * Internal Channel that publishes all UI Events.
   *
   * @constructor
   * @param {String} name
   * @param {Object} props
   */

  constructor(name = 'CHANNEL_UI', props = {}) {
    props.sendCurrentPayload = false;
    super(name, props);
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
    let keyUps = Observable.fromEvent(document, 'keyup');
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
    let eqsName = equals(obj.name, this.props.name);
    let dataObj = obsVal => ({ viewStreamInfo: obj.data, uiEvent: obsVal });
    let onSuccess = (obj) => obj.observable.pipe(map(dataObj))
      .subscribe(this.onUIEvent.bind(this));
    let onError = () => {};
    return eqsName === true ? onSuccess(obj) : onError();
  }

  getActionState(val) {
    let typeVal = path(['uiEvent', 'type']);
    let typeOverRideVal = path(['uiEvent', 'typeOverRide']);
    let eventType = compose(toUpper, either(typeOverRideVal, typeVal));
    let type = eventType(val);
    let mainAction = 'CHANNEL_UI';
    return type !== undefined ? `${mainAction}_${type}_EVENT` : mainAction;
  }

  static checkToPreventDefaultEvent(obs) {
    const checkDataForPreventDefault = pathEq(['viewStreamInfo', 'payload', 'eventPreventDefault'], 'true');
    const setPreventDefault = function(evt) { if (evt !== undefined) evt.preventDefault(); };
    const selectEvtAndPreventDefault = compose(setPreventDefault, prop('uiEvent'));
    const checkForPreventDefault = when(checkDataForPreventDefault, selectEvtAndPreventDefault);
    checkForPreventDefault(obs);
  }

  onUIEvent(obs) {
    // obs.uiEvent.preventDefault();
    // console.log("UI EVENT ",obs);

    SpyneChannelUI.checkToPreventDefaultEvent(obs);

    obs['action'] = this.getActionState(obs);
    const action = obs.action;// this.getActionState(obs);
    const { payload, srcElement } = obs.viewStreamInfo;
    const event = obs.uiEvent;
    this.sendChannelPayload(action, payload, srcElement, event);
  }
}