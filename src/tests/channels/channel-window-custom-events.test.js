import { SpyneChannelWindow } from '../../spyne/channels/spyne-channel-window'
import { Subject } from 'rxjs'
const { expect } = require('chai')

const conformedEvent = (detail) => {
  const event = new CustomEvent('my_test_event', { detail })
  return {
    action: 'CHANNEL_WINDOW_MY_TEST_EVENT_EVENT',
    payload: event,
    srcElement: undefined,
    event
  }
}

describe('window channel customEvents config conforming', () => {
  it('should conform a string entry', () => {
    const entry = SpyneChannelWindow.conformCustomEventConfig('my_event')
    expect(entry).to.deep.equal({ name: 'my_event', operator: undefined, value: undefined })
  })

  it('should conform an object entry with a buffer operator', () => {
    const entry = SpyneChannelWindow.conformCustomEventConfig({ name: 'my_event', buffer: 400 })
    expect(entry).to.deep.equal({ name: 'my_event', operator: 'buffer', value: 400 })
  })

  it('should conform debounce, throttle and count operators', () => {
    expect(SpyneChannelWindow.conformCustomEventConfig({ name: 'e1', debounce: 250 }).operator).to.equal('debounce')
    expect(SpyneChannelWindow.conformCustomEventConfig({ name: 'e2', throttle: 100 }).operator).to.equal('throttle')
    expect(SpyneChannelWindow.conformCustomEventConfig({ name: 'e3', count: 50 }).operator).to.equal('count')
  })

  it('should pick the first operator when several are set', () => {
    const entry = SpyneChannelWindow.conformCustomEventConfig({ name: 'my_event', debounce: 250, buffer: 400 })
    expect(entry.operator).to.equal('buffer')
    expect(entry.value).to.equal(400)
  })

  it('should skip invalid entries', () => {
    expect(SpyneChannelWindow.conformCustomEventConfig(42)).to.equal(null)
    expect(SpyneChannelWindow.conformCustomEventConfig({ buffer: 400 })).to.equal(null)
    expect(SpyneChannelWindow.conformCustomEventConfig(null)).to.equal(null)
  })
})

describe('window channel customEvents batching operators', () => {
  it('should map a batch to one payload with detail as the details array', () => {
    const batch = [conformedEvent({ id: 1 }), conformedEvent({ id: 2 }), conformedEvent({ id: 3 })]
    const { action, payload, event } = SpyneChannelWindow.mapBatchedEvents(batch)
    expect(action).to.equal('CHANNEL_WINDOW_MY_TEST_EVENT_EVENT')
    expect(payload.detail).to.deep.equal([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(payload.isBatch).to.be.true
    expect(payload.batchCount).to.equal(3)
    expect(event).to.equal(batch[2].event)
  })

  it('should close a buffer batch after the quiet gap and emit once', (done) => {
    const source$ = new Subject()
    const obs$ = SpyneChannelWindow.customizeCustomEventObservable(source$, 'buffer', 30)
    const emissions = []
    obs$.subscribe(p => emissions.push(p))

    source$.next(conformedEvent({ id: 1 }))
    source$.next(conformedEvent({ id: 2 }))
    setTimeout(() => source$.next(conformedEvent({ id: 3 })), 10)

    setTimeout(() => {
      expect(emissions.length).to.equal(1)
      expect(emissions[0].payload.detail).to.deep.equal([{ id: 1 }, { id: 2 }, { id: 3 }])
      done()
    }, 100)
  })

  it('should emit separate buffer batches per burst', (done) => {
    const source$ = new Subject()
    const obs$ = SpyneChannelWindow.customizeCustomEventObservable(source$, 'buffer', 20)
    const emissions = []
    obs$.subscribe(p => emissions.push(p))

    source$.next(conformedEvent({ id: 1 }))
    setTimeout(() => source$.next(conformedEvent({ id: 2 })), 60)

    setTimeout(() => {
      expect(emissions.length).to.equal(2)
      expect(emissions[0].payload.batchCount).to.equal(1)
      expect(emissions[1].payload.batchCount).to.equal(1)
      done()
    }, 140)
  })

  it('should batch every n events with the count operator', () => {
    const source$ = new Subject()
    const obs$ = SpyneChannelWindow.customizeCustomEventObservable(source$, 'count', 2)
    const emissions = []
    obs$.subscribe(p => emissions.push(p))

    source$.next(conformedEvent({ id: 1 }))
    source$.next(conformedEvent({ id: 2 }))
    source$.next(conformedEvent({ id: 3 }))
    source$.next(conformedEvent({ id: 4 }))
    source$.next(conformedEvent({ id: 5 }))

    expect(emissions.length).to.equal(2)
    expect(emissions[0].payload.detail).to.deep.equal([{ id: 1 }, { id: 2 }])
    expect(emissions[1].payload.detail).to.deep.equal([{ id: 3 }, { id: 4 }])
  })

  it('should pass only the latest event through debounce', (done) => {
    const source$ = new Subject()
    const obs$ = SpyneChannelWindow.customizeCustomEventObservable(source$, 'debounce', 20)
    const emissions = []
    obs$.subscribe(p => emissions.push(p))

    source$.next(conformedEvent({ id: 1 }))
    source$.next(conformedEvent({ id: 2 }))
    source$.next(conformedEvent({ id: 3 }))

    setTimeout(() => {
      expect(emissions.length).to.equal(1)
      // debounced events keep the single-event payload shape (payload = CustomEvent)
      expect(emissions[0].payload.detail).to.deep.equal({ id: 3 })
      done()
    }, 80)
  })

  it('should return the observable untouched when there is no operator', () => {
    const source$ = new Subject()
    const obs$ = SpyneChannelWindow.customizeCustomEventObservable(source$, undefined, undefined)
    expect(obs$).to.equal(source$)
  })
})
