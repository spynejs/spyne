import { ViewStreamBroadcaster } from '../../spyne/views/view-stream-broadcaster'
import { SpyneAppProperties } from '../../spyne/utils/spyne-app-properties'
const { expect } = require('chai')

// The broadcaster with its two senders replaced, so that a test can read what
// would have been sent without a running app.
const createBroadcaster = (el, broadcastArr) => {
  const sent = []

  class BroadcasterForTests extends ViewStreamBroadcaster {
    addMixins() {
      this.sendUIPayload = (obs, data) => sent.push(['UI', data])
      this.sendRoutePayload = (obs, data) => sent.push(['ROUTE', data])
    }
  }
  const props = { el, name: 'TestView', vsid: 'vsid-test', id: 'test-view' }

  return { broadcaster: new BroadcasterForTests(props, () => broadcastArr), sent }
}

describe('ViewStreamBroadcaster', () => {
  let el
  let warnings
  let consoleWarn

  // debug is a getter on the app's properties; a test sets what it returns
  const setDebug = (bool) => {
    Object.defineProperty(SpyneAppProperties, 'debug', { get: () => bool, configurable: true })
  }

  beforeEach(() => {
    el = document.createElement('section')
    el.innerHTML = '<button class="present">a button</button>'
    document.body.appendChild(el)
    warnings = []
    consoleWarn = console.warn
    console.warn = (str) => warnings.push(String(str))
  })

  afterEach(() => {
    console.warn = consoleWarn
    delete SpyneAppProperties.debug
    el.remove()
  })

  it('warns of a selector that matches nothing when debug is true', () => {
    setDebug(true)
    createBroadcaster(el, [['.absent', 'click']])
    expect(warnings.length).to.equal(1)
    expect(warnings[0]).to.include('The item .absent, does not appear to exist in TestView')
  })

  it('writes no warning of a selector that matches nothing when debug is false', () => {
    setDebug(false)
    const { sent } = createBroadcaster(el, [['.absent', 'click']])

    expect(warnings.length).to.equal(0)
    expect(sent.length).to.equal(0)
  })

  it('reads debug when it runs, not when its file loads', () => {
    setDebug(false)
    createBroadcaster(el, [['.absent', 'click']])
    expect(warnings.length).to.equal(0)

    setDebug(true)
    createBroadcaster(el, [['.absent', 'click']])
    expect(warnings.length).to.equal(1)

    setDebug(false)
    createBroadcaster(el, [['.absent', 'click']])
    expect(warnings.length).to.equal(1)
  })

  it('warns of an empty entry when debug is true and binds nothing', () => {
    setDebug(true)
    const { sent } = createBroadcaster(el, [[]])

    expect(warnings.length).to.equal(1)
    expect(warnings[0]).to.include('TestView.broadcastEvents appears to be empty')
    expect(sent.length).to.equal(0)
  })

  it('passes over an empty entry when debug is false, with no warning', () => {
    setDebug(false)
    const { sent } = createBroadcaster(el, [[], ['.present', 'click']])

    expect(warnings.length).to.equal(0)
    expect(sent.length).to.equal(1)
  })

  it('binds a selector that is there, whatever debug is', () => {
    [true, false].forEach((bool) => {
      setDebug(bool)
      const { sent } = createBroadcaster(el, [['.present', 'click'], ['.absent', 'click']])

      expect(sent.length).to.equal(1)
      expect(sent[0][0]).to.equal('UI')
      expect(sent[0][1].srcElement.el).to.equal(el.querySelector('.present'))
      expect(sent[0][1].srcElement.srcEvent).to.equal('click')
    })
    expect(warnings.length).to.equal(1)
  })
})
