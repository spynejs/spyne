import { baseStreamsMixins } from '../utils/mixins/base-streams-mixins.js'
import { convertDomStringMapToObj } from '../utils/frp-tools.js'
import { SpyneAppProperties } from '../utils/spyne-app-properties.js'
import { fromEvent } from 'rxjs'
import { map } from 'rxjs/operators'
import { clone, omit } from 'ramda'
const isDevMode = SpyneAppProperties.debug === true

export class ViewStreamBroadcaster {
  /**
   * The class takes in all of the elements from the 'broadcastEvents' method and directs the events to either the UI or ROUTE channels
   * @module ViewStreamBroadcaster
   * @type internal
   *
   * @constructor
   * @param {Object} props
   * @param {Function} broadcastFn
   */

  constructor(props, broadcastFn) {
    this.addMixins()
    this.props = props
    this.broadcastFn = broadcastFn
    this.broadcaster(this.broadcastFn)
  }

  addDblClickEvt(q) {
    const dblclick$ = fromEvent(q, 'dblclick')
    // console.log('ADDING DBL CLICK ', q);
    const stream$ = dblclick$.pipe(
      map(p => {
        const data = clone(p)
        // ADD DOUBLECLICK TO UI EVENTS
        data.typeOverRide = 'dblclick'
        return data
      }))
    return stream$
  }

  //  ==================================================================
  // BROADCAST BUTTON EVENTS
  //  ==================================================================
  broadcast(args) {
    if (args.length <= 0 && isDevMode === true) {
      console.warn(`Spyne Warning: The nested array in ${this.props.name}.broadcastEvents appears to be empty --> vsid:${this.props.vsid}!`)
      return
    }
    // payloads to send, based on either the array or the elements dataMap
    const channelPayloads = {
      UI: this.sendUIPayload,
      ROUTE: this.sendRoutePayload
    }
    // spread operator to select variables from arrays
    const [selector, event, local] = args
    // btn query
    let channel // hoist channel and later check if chnl exists
    let query = this.props.el.querySelectorAll(selector)

    if (query.length <= 0) {
      const el = this.props.el
      const checkParentEls = (element) => {
        if (element === el) {
          query = [element]
        }
      }

      const pluckElFromParent = () => {
        const elParent = el.parentElement !== null ? el.parentElement : document
        const elSelected = elParent.querySelectorAll(selector)
        elSelected.forEach = Array.prototype.forEach
        elSelected.forEach(checkParentEls)
      }

      pluckElFromParent()
    }

    const isLocalEvent = local !== undefined
    const addObservable = (q) => {
      // the  btn observable
      const observable = event !== 'dblClick'
        ? fromEvent(q, event, { preventDefault: () => true })
        : this.addDblClickEvt(q)
      // select channel and data values from either the array or the element's dom Map
      channel = q.dataset.channel// ifNilThenUpdate(chnl, q.dataset.channel);
      const data = {}// convertDomStringMapToObj(q.dataset);
      data.payload = convertDomStringMapToObj(q.dataset)
      data.payload = omit(['channel'], data.payload)
      data.channel = channel
      // payload needs vsid# to pass verification

      data.srcElement = {}// pick(['vsid','viewName'], data);
      data.srcElement.id = this.props.id
      data.srcElement.vsid = this.props.vsid
      data.srcElement.isLocalEvent = isLocalEvent
      // data.srcElement['viewName'] = this.props.name;
      data.srcElement.srcEvent = event
      data.srcElement.el = q
      // select the correct payload

      function getValidChannel(ch) {
        if (ch === 'ROUTE' || ch === 'CHANNEL_ROUTE') {
          return 'ROUTE'
        }
        if (ch !== 'UI' && ch !== 'CHANNEL_UI' && ch !== undefined) {
          console.warn(`SpyneJS warning: The channel, ${ch}, is not allowed here, only "UI" or "ROUTE" are valid channels, defaulting to CHANNEL_UI`)
        }
        return 'UI'
      }

      const channelPayload = channelPayloads[getValidChannel(channel)]
      // run payload
      channelPayload(observable, data)
    }
    const queryIsNil = query === undefined || query.length <= 0
    if (queryIsNil === true && isDevMode === true) {
      console.warn(`Spyne Warning: The item ${selector}, does not appear to exist in ${this.props.name} --> vsid:${this.props.vsid}!`)

      // addObservable(query, event);
    } else {
      query.forEach = Array.prototype.forEach
      query.forEach(addObservable)
    }
  }

  broadcaster(arrFn) {
    const broadcastArr = arrFn()
    broadcastArr.forEach(args => this.broadcast(args))
  }

  //  =================================================================
  addMixins() {
    //  ==================================
    // BASE STREAM MIXINS
    //  ==================================
    const streamMixins = baseStreamsMixins()
    this.sendUIPayload = streamMixins.sendUIPayload
    this.sendRoutePayload = streamMixins.sendRoutePayload
  }
}
