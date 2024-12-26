import { Channel } from './channel'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { equals, path, compose, prop, filter, replace, lensProp, over, omit, test, keys, either, toUpper } from 'ramda'

export class SpyneChannelUI extends Channel {
  /**
   * @module SpyneChannelUI
   * @type core
   *
   * @desc
   * <p>This Channel listens to all User Events that have been set to broadcast by ViewStream instances, using the broadCastEvents method.</p>
   * <p>HTML Elements that have their data channel property set to "ROUTE" will broadcast their ui event to that channel instead.</p>
   * <div class='btn btn-blue-ref btn-console modal-btn'  data-type='modal-window' data-value='uiEvents'>View UI Events</div></br></br>
   * <p>See LINK['ViewStream', 'view-stream'] for an example on how to bind HTML Elements to the UI Channel.</p>
   *
   * @constructor
   * @property {String} CHANNEL_NAME - = 'CHANNEL_UI';
   *
   *
   */

  constructor(name = 'CHANNEL_UI', props = {}) {
    props.sendCachedPayload = false
    super(name, props)
    this.keyEventsLoaded = false
    this.keyCodeArr = []
  }

  addRegisteredActions() {
    return [
      'CHANNEL_UI_DOMCONTENTLOADED_EVENT',
      'CHANNEL_UI_ABORT_EVENT',
      'CHANNEL_UI_ACTIVATE_EVENT',
      'CHANNEL_UI_ADDTRACK_EVENT',
      'CHANNEL_UI_AFTERPRINT_EVENT',
      'CHANNEL_UI_AFTERSCRIPTEXECUTE_EVENT',
      'CHANNEL_UI_ANIMATIONCANCEL_EVENT',
      'CHANNEL_UI_ANIMATIONEND_EVENT',
      'CHANNEL_UI_ANIMATIONITERATION_EVENT',
      'CHANNEL_UI_ANIMATIONSTART_EVENT',
      'CHANNEL_UI_APPINSTALLED_EVENT',
      'CHANNEL_UI_AUDIOEND_EVENT',
      'CHANNEL_UI_AUDIOSTART_EVENT',
      'CHANNEL_UI_AUXCLICK_EVENT',
      'CHANNEL_UI_BEFOREINPUT_EVENT',
      'CHANNEL_UI_BEFOREPRINT_EVENT',
      'CHANNEL_UI_BEFOREUNLOAD_EVENT',
      'CHANNEL_UI_BEGINEVENT_EVENT',
      'CHANNEL_UI_BLOCKED_EVENT',
      'CHANNEL_UI_BLUR_EVENT',
      'CHANNEL_UI_BOUNDARY_EVENT',
      'CHANNEL_UI_BUFFEREDAMOUNTLOW_EVENT',
      'CHANNEL_UI_CANCEL_EVENT',
      'CHANNEL_UI_CANPLAY_EVENT',
      'CHANNEL_UI_CANPLAYTHROUGH_EVENT',
      'CHANNEL_UI_CHANGE_EVENT',
      'CHANNEL_UI_CLICK_EVENT',
      'CHANNEL_UI_CLOSE_EVENT',
      'CHANNEL_UI_CLOSING_EVENT',
      'CHANNEL_UI_COMPLETE_EVENT',
      'CHANNEL_UI_COMPOSITIONEND_EVENT',
      'CHANNEL_UI_COMPOSITIONSTART_EVENT',
      'CHANNEL_UI_COMPOSITIONUPDATE_EVENT',
      'CHANNEL_UI_CONNECT_EVENT',
      'CHANNEL_UI_CONNECTIONSTATECHANGE_EVENT',
      'CHANNEL_UI_CONTENTDELETE_EVENT',
      'CHANNEL_UI_CONTEXTMENU_EVENT',
      'CHANNEL_UI_COPY_EVENT',
      'CHANNEL_UI_CUECHANGE_EVENT',
      'CHANNEL_UI_CUT_EVENT',
      'CHANNEL_UI_DATACHANNEL_EVENT',
      'CHANNEL_UI_DBLCLICK_EVENT',
      'CHANNEL_UI_DEVICECHANGE_EVENT',
      'CHANNEL_UI_DEVICEMOTION_EVENT',
      'CHANNEL_UI_DEVICEORIENTATION_EVENT',
      'CHANNEL_UI_DRAG_EVENT',
      'CHANNEL_UI_DRAGEND_EVENT',
      'CHANNEL_UI_DRAGENTER_EVENT',
      'CHANNEL_UI_DRAGLEAVE_EVENT',
      'CHANNEL_UI_DRAGOVER_EVENT',
      'CHANNEL_UI_DRAGSTART_EVENT',
      'CHANNEL_UI_DROP_EVENT',
      'CHANNEL_UI_DURATIONCHANGE_EVENT',
      'CHANNEL_UI_EMPTIED_EVENT',
      'CHANNEL_UI_END_EVENT',
      'CHANNEL_UI_ENDEVENT_EVENT',
      'CHANNEL_UI_ENDED_EVENT',
      'CHANNEL_UI_ENTERPICTUREINPICTURE_EVENT',
      'CHANNEL_UI_ERROR_EVENT',
      'CHANNEL_UI_FOCUS_EVENT',
      'CHANNEL_UI_FOCUSIN_EVENT',
      'CHANNEL_UI_FOCUSOUT_EVENT',
      'CHANNEL_UI_FORMDATA_EVENT',
      'CHANNEL_UI_FULLSCREENCHANGE_EVENT',
      'CHANNEL_UI_FULLSCREENERROR_EVENT',
      'CHANNEL_UI_GAMEPADCONNECTED_EVENT',
      'CHANNEL_UI_GAMEPADDISCONNECTED_EVENT',
      'CHANNEL_UI_GATHERINGSTATECHANGE_EVENT',
      'CHANNEL_UI_GESTURECHANGE_EVENT',
      'CHANNEL_UI_GESTUREEND_EVENT',
      'CHANNEL_UI_GESTURESTART_EVENT',
      'CHANNEL_UI_GOTPOINTERCAPTURE_EVENT',
      'CHANNEL_UI_HASHCHANGE_EVENT',
      'CHANNEL_UI_ICECANDIDATE_EVENT',
      'CHANNEL_UI_ICECANDIDATEERROR_EVENT',
      'CHANNEL_UI_ICECONNECTIONSTATECHANGE_EVENT',
      'CHANNEL_UI_ICEGATHERINGSTATECHANGE_EVENT',
      'CHANNEL_UI_INPUT_EVENT',
      'CHANNEL_UI_INPUTSOURCESCHANGE_EVENT',
      'CHANNEL_UI_INSTALL_EVENT',
      'CHANNEL_UI_INVALID_EVENT',
      'CHANNEL_UI_KEYDOWN_EVENT',
      'CHANNEL_UI_KEYUP_EVENT',
      'CHANNEL_UI_LANGUAGECHANGE_EVENT',
      'CHANNEL_UI_LEAVEPICTUREINPICTURE_EVENT',
      'CHANNEL_UI_LOAD_EVENT',
      'CHANNEL_UI_LOADEDDATA_EVENT',
      'CHANNEL_UI_LOADEDMETADATA_EVENT',
      'CHANNEL_UI_LOADEND_EVENT',
      'CHANNEL_UI_LOADSTART_EVENT',
      'CHANNEL_UI_LOSTPOINTERCAPTURE_EVENT',
      'CHANNEL_UI_MARK_EVENT',
      'CHANNEL_UI_MERCHANTVALIDATION_EVENT',
      'CHANNEL_UI_MESSAGE_EVENT',
      'CHANNEL_UI_MESSAGEERROR_EVENT',
      'CHANNEL_UI_MOUSEDOWN_EVENT',
      'CHANNEL_UI_MOUSEENTER_EVENT',
      'CHANNEL_UI_MOUSELEAVE_EVENT',
      'CHANNEL_UI_MOUSEMOVE_EVENT',
      'CHANNEL_UI_MOUSEOUT_EVENT',
      'CHANNEL_UI_MOUSEOVER_EVENT',
      'CHANNEL_UI_MOUSEUP_EVENT',
      'CHANNEL_UI_MUTE_EVENT',
      'CHANNEL_UI_NEGOTIATIONNEEDED_EVENT',
      'CHANNEL_UI_NOMATCH_EVENT',
      'CHANNEL_UI_NOTIFICATIONCLICK_EVENT',
      'CHANNEL_UI_OFFLINE_EVENT',
      'CHANNEL_UI_ONLINE_EVENT',
      'CHANNEL_UI_OPEN_EVENT',
      'CHANNEL_UI_ORIENTATIONCHANGE_EVENT',
      'CHANNEL_UI_PAGEHIDE_EVENT',
      'CHANNEL_UI_PAGESHOW_EVENT',
      'CHANNEL_UI_PASTE_EVENT',
      'CHANNEL_UI_PAUSE_EVENT',
      'CHANNEL_UI_PAYERDETAILCHANGE_EVENT',
      'CHANNEL_UI_PAYMENTMETHODCHANGE_EVENT',
      'CHANNEL_UI_PLAY_EVENT',
      'CHANNEL_UI_PLAYING_EVENT',
      'CHANNEL_UI_POINTERCANCEL_EVENT',
      'CHANNEL_UI_POINTERDOWN_EVENT',
      'CHANNEL_UI_POINTERENTER_EVENT',
      'CHANNEL_UI_POINTERLEAVE_EVENT',
      'CHANNEL_UI_POINTERLOCKCHANGE_EVENT',
      'CHANNEL_UI_POINTERLOCKERROR_EVENT',
      'CHANNEL_UI_POINTERMOVE_EVENT',
      'CHANNEL_UI_POINTEROUT_EVENT',
      'CHANNEL_UI_POINTEROVER_EVENT',
      'CHANNEL_UI_POINTERUP_EVENT',
      'CHANNEL_UI_POPSTATE_EVENT',
      'CHANNEL_UI_PROGRESS_EVENT',
      'CHANNEL_UI_PUSH_EVENT',
      'CHANNEL_UI_PUSHSUBSCRIPTIONCHANGE_EVENT',
      'CHANNEL_UI_RATECHANGE_EVENT',
      'CHANNEL_UI_READYSTATECHANGE_EVENT',
      'CHANNEL_UI_REJECTIONHANDLED_EVENT',
      'CHANNEL_UI_REMOVETRACK_EVENT',
      'CHANNEL_UI_REMOVESTREAM_EVENT',
      'CHANNEL_UI_REPEATEVENT_EVENT',
      'CHANNEL_UI_RESET_EVENT',
      'CHANNEL_UI_RESIZE_EVENT',
      'CHANNEL_UI_RESOURCETIMINGBUFFERFULL_EVENT',
      'CHANNEL_UI_RESULT_EVENT',
      'CHANNEL_UI_RESUME_EVENT',
      'CHANNEL_UI_SCROLL_EVENT',
      'CHANNEL_UI_SEARCH_EVENT',
      'CHANNEL_UI_SEEKED_EVENT',
      'CHANNEL_UI_SEEKING_EVENT',
      'CHANNEL_UI_SELECT_EVENT',
      'CHANNEL_UI_SELECTEDCANDIDATEPAIRCHANGE_EVENT',
      'CHANNEL_UI_SELECTEND_EVENT',
      'CHANNEL_UI_SELECTIONCHANGE_EVENT',
      'CHANNEL_UI_SELECTSTART_EVENT',
      'CHANNEL_UI_SHIPPINGADDRESSCHANGE_EVENT',
      'CHANNEL_UI_SHIPPINGOPTIONCHANGE_EVENT',
      'CHANNEL_UI_SIGNALINGSTATECHANGE_EVENT',
      'CHANNEL_UI_SLOTCHANGE_EVENT',
      'CHANNEL_UI_SOUNDEND_EVENT',
      'CHANNEL_UI_SOUNDSTART_EVENT',
      'CHANNEL_UI_SPEECHEND_EVENT',
      'CHANNEL_UI_SPEECHSTART_EVENT',
      'CHANNEL_UI_SQUEEZE_EVENT',
      'CHANNEL_UI_SQUEEZEEND_EVENT',
      'CHANNEL_UI_SQUEEZESTART_EVENT',
      'CHANNEL_UI_STALLED_EVENT',
      'CHANNEL_UI_START_EVENT',
      'CHANNEL_UI_STATECHANGE_EVENT',
      'CHANNEL_UI_STORAGE_EVENT',
      'CHANNEL_UI_SUBMIT_EVENT',
      'CHANNEL_UI_SUCCESS_EVENT',
      'CHANNEL_UI_SUSPEND_EVENT',
      'CHANNEL_UI_TIMEOUT_EVENT',
      'CHANNEL_UI_TIMEUPDATE_EVENT',
      'CHANNEL_UI_TOGGLE_EVENT',
      'CHANNEL_UI_TONECHANGE_EVENT',
      'CHANNEL_UI_TOUCHCANCEL_EVENT',
      'CHANNEL_UI_TOUCHEND_EVENT',
      'CHANNEL_UI_TOUCHMOVE_EVENT',
      'CHANNEL_UI_TOUCHSTART_EVENT',
      'CHANNEL_UI_TRACK_EVENT',
      'CHANNEL_UI_TRANSITIONCANCEL_EVENT',
      'CHANNEL_UI_TRANSITIONEND_EVENT',
      'CHANNEL_UI_TRANSITIONRUN_EVENT',
      'CHANNEL_UI_TRANSITIONSTART_EVENT',
      'CHANNEL_UI_UNHANDLEDREJECTION_EVENT',
      'CHANNEL_UI_UNLOAD_EVENT',
      'CHANNEL_UI_UNMUTE_EVENT',
      'CHANNEL_UI_UPGRADENEEDED_EVENT',
      'CHANNEL_UI_VERSIONCHANGE_EVENT',
      'CHANNEL_UI_VISIBILITYCHANGE_EVENT',
      'CHANNEL_UI_VOICESCHANGED_EVENT',
      'CHANNEL_UI_VOLUMECHANGE_EVENT',
      'CHANNEL_UI_VRDISPLAYACTIVATE_EVENT',
      'CHANNEL_UI_VRDISPLAYBLUR_EVENT',
      'CHANNEL_UI_VRDISPLAYCONNECT_EVENT',
      'CHANNEL_UI_VRDISPLAYDEACTIVATE_EVENT',
      'CHANNEL_UI_VRDISPLAYDISCONNECT_EVENT',
      'CHANNEL_UI_VRDISPLAYFOCUS_EVENT',
      'CHANNEL_UI_VRDISPLAYPOINTERRESTRICTED_EVENT',
      'CHANNEL_UI_VRDISPLAYPOINTERUNRESTRICTED_EVENT',
      'CHANNEL_UI_VRDISPLAYPRESENTCHANGE_EVENT',
      'CHANNEL_UI_WAITING_EVENT',
      'CHANNEL_UI_WEBGLCONTEXTCREATIONERROR_EVENT',
      'CHANNEL_UI_WEBGLCONTEXTLOST_EVENT',
      'CHANNEL_UI_WEBGLCONTEXTRESTORED_EVENT',
      'CHANNEL_UI_WEBKITMOUSEFORCECHANGED_EVENT',
      'CHANNEL_UI_WEBKITMOUSEFORCEDOWN_EVENT',
      'CHANNEL_UI_WEBKITMOUSEFORCEUP_EVENT',
      'CHANNEL_UI_WEBKITMOUSEFORCEWILLBEGIN_EVENT',
      'CHANNEL_UI_WHEEL_EVENT'
    ]
  }

  loadKeyStream() {
    const keyUps = Observable.fromEvent(document, 'keyup')
    const filterKeys = e => this.keyCodeArr.indexOf(e.keyCode) >= 0
    this.keyPresses$ = keyUps.groupBy(e => e.keyCode)
      .mergeAll()
      .filter(filterKeys)
      .repeat()
      .subscribe(this.onKeyPressed.bind(this))
  }

  addKeyEvent(num) {
    if (this.keyEventsLoaded === false) {
      this.loadKeyStream()
    }
    this.keyEventsLoaded = true
    this.registerKey(num)
  }

  registerKey(c) {
    this.keyCodeArr.push(c)
  }

  onKeyPressed(evt) {
    // console.log('key is ', evt);
  }

  static removeSSID(pl) {
    const routeLens = lensProp(['payload'])
    const omitSSID = over(routeLens, omit(['vsid']))
    return omitSSID(pl)
  }

  onIncomingObservable(obj) {
    const eqsName = equals(obj.name, this.props.name)
    obj.data = SpyneChannelUI.removeSSID(obj.data)
    const { payload, srcElement } = obj.data
    const dataObj = obsVal => ({ payload, srcElement, event: obsVal })
    const onSuccess = (obj) => obj.observable.pipe(map(dataObj))
      .subscribe(this.onUIEvent.bind(this))
    const onError = () => {}
    return eqsName === true ? onSuccess(obj) : onError()
  }

  getActionState(val) {
    const typeVal = path(['event', 'type'])
    const typeOverRideVal = path(['event', 'typeOverRide'])
    const eventType = compose(toUpper, either(typeOverRideVal, typeVal))
    const type = eventType(val)
    const mainAction = 'CHANNEL_UI'
    return type !== undefined ? `${mainAction}_${type}_EVENT` : mainAction
  }

  static checkForEventMethods(obs) {
    const re = /^(event)([A-Z].*)([A-Z].*)$/gm
    const getMethods = compose(filter(test(re)), keys, prop('payload'))
    const methodsArr = getMethods(obs)
    if (methodsArr.length >= 1) {
      const evt = prop('event', obs)
      if (evt !== undefined) {
        const methodUpdate = (match, p1, p2, p3, p4) => String(p2).toLowerCase() + p3 + p4
        const methodStrReplace = replace(/^(event)([A-Z])(.*)([A-Z].*)$/gm, methodUpdate)
        const runMethod = (methodStr) => {
          const m = methodStrReplace(methodStr)
          if (evt[m] !== undefined && typeof (evt[m]) === 'function') { evt[m]() }
        }
        methodsArr.forEach(runMethod)
      }
    }

    return obs
  }

  onUIEvent(obs) {
    SpyneChannelUI.checkForEventMethods(obs)
    obs.action = this.getActionState(obs)
    const action = obs.action// this.getActionState(obs);
    const { payload, srcElement } = obs
    const event = obs.event
    this.sendChannelPayload(action, payload, srcElement, event)
  }
}
