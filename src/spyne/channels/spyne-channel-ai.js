import { Channel } from './channel.js'

export class SpyneChannelAI extends Channel {
  /**
   * @module SpyneChannelAI
   * @type core
   *
   * @desc
   * Internal Channel that publishes rendering and disposing events of all ViewStreams whose property, proper.sendAIEvents is set to true.
   *
   * <h3>The two actions that are regsitered for this channel are:</h3>
   * <ul>
   * <li>CHANNEL_AI_RENDERED_EVENT</li>
   * <li>CHANNEL_AI_DISPOSED_EVENT</li>
   *  </ul>
   * @constructor
   * @property {String} CHANNEL_NAME - = 'CHANNEL_AI';
   */

  constructor(props = {}) {
    super('CHANNEL_AI', props)
  }

  addRegisteredActions() {
    return [
      'CHANNEL_AI_RENDERED_EVENT',
      'CHANNEL_AI_DISPOSED_EVENT'
    ]
  }

  onViewStreamInfo(obj) {
    const { action, srcElement } = obj
    const payload = srcElement
    payload.action = action
    this.onSendEvent(action, payload)
  }

  onSendEvent(actionStr, payload = {}) {
    const action = this.channelActions[actionStr]
    const srcElement = {}
    const event = undefined
    const delayStream = () => this.sendChannelPayload(action, payload, srcElement, event)
    window.setTimeout(delayStream, 0)
  }
}
