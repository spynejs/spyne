import { SpyneChannelUI } from '../../spyne/channels/spyne-channel-ui'
import { payloadPreventDefault, payloadStopPropagation, payloadTwoEvents, payloadNoEvent, payloadEmptyEvent } from '../mocks/payload-ui'

describe('root test', () => {
  const payload_eventPreventDefault =

  it('should return no event from ui payload', () => {
    const payload = R.clone(payloadNoEvent)
    const payloadUpdate = SpyneChannelUI.checkForEventMethods(payload)

    return true
  })

  it('should return event paylaod from ui payload', () => {
    const payload = R.clone(payloadPreventDefault)
    const payloadUpdate = SpyneChannelUI.checkForEventMethods(payload)

    return true
  })

  it('should return event paylaods from ui payload', () => {
    const payload = R.clone(payloadTwoEvents)
    const payloadUpdate = SpyneChannelUI.checkForEventMethods(payload)

    return true
  })
})
