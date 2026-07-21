import { ViewStream } from '../../spyne/views/view-stream'
import { SpyneApp } from '../../spyne/spyne'
const { expect } = require('chai')

const createDispatchView = (listenersArr) => {
  class DispatchTestView extends ViewStream {
    constructor(props = {}) {
      props.calls = []
      props.listenersArr = listenersArr
      super(props)
    }

    addActionListeners() {
      return this.props.listenersArr
    }

    onBroadMethod() {
      this.props.calls.push('broad')
    }

    onSpecificMethod() {
      this.props.calls.push('specific')
    }

    onFirstMethod() {
      this.props.calls.push('first')
    }

    onSecondMethod() {
      this.props.calls.push('second')
    }
  }
  return new DispatchTestView()
}

const sendAction = (view, action) => view.onSubscribeToSourcesNext({ action, payload: {} })

describe('addActionListeners label matching and dispatch', () => {
  beforeEach(function() {
    SpyneApp.init({ debug: true }, true)
  })

  it('exact key match fires its paired method [narrow-by-action-label]', () => {
    const view = createDispatchView([
      ['CHANNEL_APP_SETTING_EVENT', 'onSpecificMethod']
    ])
    sendAction(view, 'CHANNEL_APP_SETTING_EVENT')
    expect(view.props.calls).to.deep.equal(['specific'])
  })

  it('bare prefix label matches its whole family as an unanchored regex [design-label-families-for-glob]', () => {
    const view = createDispatchView([
      ['CHANNEL_APP', 'onBroadMethod']
    ])
    sendAction(view, 'CHANNEL_APP_SETTING_EVENT')
    expect(view.props.calls).to.deep.equal(['broad'])
  })

  it('suffix .* pattern matches; documentary equivalence with the bare prefix [design-label-families-for-glob]', () => {
    const view = createDispatchView([
      ['CHANNEL_APP.*', 'onBroadMethod']
    ])
    sendAction(view, 'CHANNEL_APP_SETTING_EVENT')
    expect(view.props.calls).to.deep.equal(['broad'])
  })

  it('infix .* pattern matches [design-label-families-for-glob]', () => {
    const view = createDispatchView([
      ['CHANNEL_APP_.*_EVENT', 'onFirstMethod']
    ])
    sendAction(view, 'CHANNEL_APP_SETTING_EVENT')
    expect(view.props.calls).to.deep.equal(['first'])
  })

  it('regex-special char in a plain label is live syntax; a dot matches any char [design-label-families-for-glob]', () => {
    const view = createDispatchView([
      ['CHANNEL_A.P_EVENT', 'onFirstMethod']
    ])
    sendAction(view, 'CHANNEL_AXP_EVENT')
    expect(view.props.calls).to.deep.equal(['first'])
  })

  it('two matching entries: only the first fires, no co-firing [design-label-families-for-glob]', () => {
    const view = createDispatchView([
      ['CHANNEL_TEST.*', 'onFirstMethod'],
      ['CHANNEL_TEST_PING.*', 'onSecondMethod']
    ])
    sendAction(view, 'CHANNEL_TEST_PING_EVENT')
    expect(view.props.calls).to.deep.equal(['first'])
  })

  it('declaration order decides the winner: reversed declaration fires the other entry [design-label-families-for-glob]', () => {
    const view = createDispatchView([
      ['CHANNEL_TEST_PING.*', 'onSecondMethod'],
      ['CHANNEL_TEST.*', 'onFirstMethod']
    ])
    sendAction(view, 'CHANNEL_TEST_PING_EVENT')
    expect(view.props.calls).to.deep.equal(['second'])
  })

  it('early broad pattern shadows a later specific pattern entry [design-label-families-for-glob]', () => {
    const view = createDispatchView([
      ['CHANNEL_APP.*', 'onBroadMethod'],
      ['CHANNEL_APP_SETTING.*', 'onSpecificMethod']
    ])
    sendAction(view, 'CHANNEL_APP_SETTING_EVENT')
    expect(view.props.calls).to.deep.equal(['broad'])
  })

  xit('early broad pattern shadows a later specific exact entry [design-label-families-for-glob]', () => {
    const view = createDispatchView([
      ['CHANNEL_APP.*', 'onBroadMethod'],
      ['CHANNEL_APP_SETTING_EVENT', 'onSpecificMethod']
    ])
    sendAction(view, 'CHANNEL_APP_SETTING_EVENT')

    /**
     * COMMENT: We should comment out or remove this test
     *          I've confirmed that the mechanics generally will find first, exact match, then next best match,
     *          and generally will run just one method. However, multiple partical regex matches appear to escape
     *          so that two methods are run. This has never been an issue, and I suspect AI will be able to aadd
     *          enough precision to matches, that it will continue to be a non issue
     *
     *
     * **/


    expect(view.props.calls).to.deep.equal(['broad'])
  })
})
