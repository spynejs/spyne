import { SpyneChannelRoute } from './spyne-channel-route'
import { SpyneChannelUI } from './spyne-channel-ui'
import { SpyneChannelWindow } from './spyne-channel-window'
import { SpyneChannelLifecycle } from './spyne-channel-lifecycle'

import { Subject } from 'rxjs'
import { ChannelProxy } from './channel-proxy'
import { propEq, pluck, prop, filter, pathEq, reject, compose, join, map as rMap } from 'ramda'

const _map = new Map()

export class ChannelsMap {
  /**
   * @module ChannelsDelegator
   * @type internal
   *
   * @desc
   * This object creates the logic so that Channels and ViewStreams can communicate with each other
   *
   * @constructor
   *
   */

  constructor() {
    this.addMixins()
    _map.set('DISPATCHER', new Subject())
    this.listRegisteredChannels = ChannelsMap.listRegisteredChannels.bind(this)
    this.getChannelsList = ChannelsMap.getChannelsList.bind(this)
  }

  get map() {
    return _map
  }

  static getChannelsList() {
    const proxyMapFn =  (k, v) => {
      const key = k[0]
      const val = k[1].constructor.name
      return { key, val }
    }
    return Array.from(_map, proxyMapFn)
  }

  static listRegisteredChannels(showOnlyProxies = false) {
    const proxyMap = this.getChannelsList()
    const rejectProxyFn = reject(propEq('ChannelProxy', 'val'))
    const filterProxyFn = filter(propEq('ChannelProxy', 'val'))
    const fn = showOnlyProxies === true ? filterProxyFn : rejectProxyFn
    const removedProxyArr = fn(proxyMap)
    return pluck(['key'], removedProxyArr)
  }

  listProxyChannels() {
    return this.listRegisteredChannels(true)
  }

  checkForMissingChannels() {
    const proxyMap = this.getChannelsList()
    const filterProxyFn = filter(propEq('ChannelProxy', 'val'))
    const filterProxyArr = filterProxyFn(proxyMap)

    if (filterProxyArr.length >= 1) {
      const channelStr = filterProxyArr.length === 1 ? 'Channel has' : 'Channels have'
      const channels = compose(join(', '), rMap(prop('key')))(filterProxyArr)
      const filterPrefixWarning = `Spyne Warning: The following ${channelStr} not been initialized: ${channels}`
      console.warn(filterPrefixWarning)
    }
  }

  init() {
    this.createMainStreams()
  }

  createMainStreams() {
    this.routeStream = new SpyneChannelRoute()
    _map.set('CHANNEL_ROUTE', this.routeStream)

    this.uiStream = new SpyneChannelUI()
    _map.set('CHANNEL_UI', this.uiStream)

    this.domStream = new SpyneChannelWindow()
    _map.set('CHANNEL_WINDOW', this.domStream)

    this.viewStreamLifecycle = new SpyneChannelLifecycle()
    _map.set('CHANNEL_LIFECYCLE', this.viewStreamLifecycle)

    this.routeStream.initializeStream()
    this.domStream.initializeStream()
  }

  addKeyEvent(key) {
    _map.get('UI').addKeyEvent(key)
  }

  registerStream(val) {
    const name = val.channelName
    const nameExists = _map.has(name)
    if (nameExists) {
      const isAlreadyRegisterd = compose(pathEq(['props', 'isRegistered'], true))(_map.get(name))
      if (isAlreadyRegisterd) {
        console.warn(`Spyne Warning: The Channel, ${name}, has already been registered!`)
        return
      }
    }

    _map.set(name, val)
    val.initializeStream()
  }

  getChannelActions(str) {
    return _map.get(str).addRegisteredActions()
  }

  getProxySubject(name, isReplaySubject = false) {
    const subjectType = isReplaySubject === true ? 'replaySubject' : 'subject'

    return _map.get(name)[subjectType]
  }

  testStream(name) {
    return _map.get(name) !== undefined
  }

  getStream(name) {
    if (this.testStream(name) === false) {
      _map.set(name, new ChannelProxy(name))
    }

    return _map.get(name)
  }

  addMixins() {
    //  ==================================
    // BASE CORE DECORATORS
    //  ==================================
    // let coreMixins =  baseCoreMixins();
    //  ==================================
    // BASE STREAMS DECORATORS
    //  ==================================
    // let streamsMixins = BaseStreamsMixins();
  }
}
