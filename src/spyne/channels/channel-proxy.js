import { Channel } from './channel'
import { SpyneAppProperties } from '../utils/spyne-app-properties'
import { Subject, ReplaySubject, merge } from 'rxjs'
import { includes } from 'ramda'
import { delayCall } from '../utils/frp-tools'

export class ChannelProxy extends Channel {
  /**
   * @module ChannelProxy
   * @type internal
   *
   * @constructor
   * @param {String} name
   * @param {Object} props
   *
   * @desc
   * A proxy channel is created when a channel is subscribed to before it is registered.
   *
   */
  constructor(name, props = {}) {
    props.isProxy = true
    super(name, props)
    this.props = props
    this.subject$ = new Subject()
    this.replaySub$ = new ReplaySubject(1)
    this.observer$ = merge(this.subject$, this.replaySub$)
    const isDevMode = SpyneAppProperties.debug
    if (isDevMode === true) {
      this.checkIfChannelIsStillProxy(name)
    }
  }

  getMergedSubject(peristData = false) {
    return peristData === true ? this.replaySub$ : this.subject$
  }

  checkIfChannelIsStillProxy(channelName) {
    const name = channelName

    const checkIfProxy = () => {
      const bool = includes(name, SpyneAppProperties.listRegisteredChannels())
      if (bool !== true) {
        console.warn(`Spyne Warning: The channel, ${name} does not appear to be registered!`)
      }
    }

    delayCall(checkIfProxy, 1000)
  }

  get replaySubject() {
    return this.replaySub$
  }

  get subject() {
    return this.subject$
  }
}
