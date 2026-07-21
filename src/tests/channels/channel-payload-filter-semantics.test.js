import { ChannelPayloadFilter } from '../../spyne/utils/channel-payload-filter'
import { SpyneApp } from '../../spyne/spyne'
const { expect } = require('chai')

describe('ChannelPayloadFilter envelope and predicate semantics', () => {
  let ul

  beforeEach(function() {
    SpyneApp.init({ debug: true }, true)

    ul = document.createElement('ul')
    ul.innerHTML = '<li class="flt-item" id="flt-item-one"><span class="flt-inner">one</span></li>'
    document.body.appendChild(ul)
  })

  afterEach(function() {
    ul.remove()
  })

  const getSrcElement = () => ({ el: document.querySelector('#flt-item-one') })

  it('action key (string) matches the envelope action [admit-by-payload-filter]', () => {
    const cpFilter = new ChannelPayloadFilter({ action: 'CHANNEL_UI_CLICK_EVENT' })
    const payloadBool = cpFilter({
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: { eventType: 'menuDrawer' },
      srcElement: getSrcElement()
    })
    expect(payloadBool).to.be.true
  })

  it('payload keys are surfaced at the top level and shadow the envelope action for matching [admit-by-payload-filter]', () => {
    const cpFilter = new ChannelPayloadFilter({ action: 'CHANNEL_UI_CLICK_EVENT' })
    const payloadBool = cpFilter({
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: { action: 'add' },
      srcElement: getSrcElement()
    })

    /**
     * COMMENT: SHOULD BE FALSE
     *          payload properties are surfaced so that a barrel object, const o = Object.assign({}, v, srcElement, event, payload)
     *          can match all values at top level.
     *          The action property is searching this way defaults to the ChannelPayload payload.action value
     *
     *          property matching for payload objects will be explained to add a predicate method, payload: p=>p.action==='add'
     *
     * */
    expect(payloadBool).to.be.false
  })

  it('a shadowed action key matches the payload action value [admit-by-payload-filter]', () => {
    /**
     * RULED: payload.action overrides the envelope action in the barrel
     * object, so an action key matches the payload's value when shadowed.
     * Matching payload data by intent is done with a payload predicate.
     * */
    const cpFilter = new ChannelPayloadFilter({ action: 'add' })
    const payloadBool = cpFilter({
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: { action: 'add' },
      srcElement: getSrcElement()
    })

    expect(payloadBool).to.be.true
  })

  it('payload predicate form admits on payload data [admit-by-payload-filter]', () => {
    const cpFilter = new ChannelPayloadFilter({ payload: (p) => p.action === 'add' })
    const payloadBool = cpFilter({
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: { action: 'add' }
    })
    expect(payloadBool).to.be.true
  })

  it('payload predicate form blocks on payload data [admit-by-payload-filter]', () => {
    const cpFilter = new ChannelPayloadFilter({ payload: (p) => p.action === 'add' })
    const payloadBool = cpFilter({
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: { action: 'remove' }
    })
    expect(payloadBool).to.be.false
  })

  it('selector string form matches against srcElement [gate-interactivity-via-class-and-filter]', () => {
    const cpFilter = new ChannelPayloadFilter('.flt-item')
    const payloadBool = cpFilter({
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: {},
      srcElement: getSrcElement()
    })
    expect(payloadBool).to.be.true
  })

  it('selector array form matches against srcElement when any member matches [admit-by-payload-filter]', () => {
    const cpFilter = new ChannelPayloadFilter(['.does-not-exist', '.flt-item'])
    const payloadBool = cpFilter({
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: {},
      srcElement: getSrcElement()
    })
    expect(payloadBool).to.be.true
  })

  it('event predicate receives the payload event tier [admit-by-payload-filter]', () => {
    // RULED: event conformation (the circular-safe subset) is ChannelPayload's
    // job, not the filter's — the filter never sees a raw circular event from
    // a ChannelPayload. The conformed-subset semantic is asserted at the
    // envelope in tranche 2; here the filter only routes the event tier.
    const conformedEvent = { value: 'v', x: 1, y: 2, width: 3, height: 4, target: 'div' }

    const cpFilter = new ChannelPayloadFilter({
      event: (ev) => ev.value === 'v'
    })
    const payloadBool = cpFilter({
      action: 'CHANNEL_UI_KEYUP_EVENT',
      payload: {},
      event: conformedEvent
    })
    expect(payloadBool).to.be.true
  })

  it('numeric threshold function predicate admits at the threshold and blocks above it [dispose-by-negative-filter]', () => {
    const cpFilter = new ChannelPayloadFilter({ payload: (v) => v.moveNum <= 3 })
    const admitBool = cpFilter({ action: 'CHANNEL_GAME_MOVE_EVENT', payload: { moveNum: 2 } })
    const blockBool = cpFilter({ action: 'CHANNEL_GAME_MOVE_EVENT', payload: { moveNum: 5 } })
    expect(admitBool).to.be.true
    expect(blockBool).to.be.false
  })

  it('a filter with only an unknown key fails closed; every declared criterion must pass [admit-by-payload-filter]', () => {
    /*
    * RULED: All predicates need to return true in order for the filter to
    * pass; an unknown key compares against undefined and becomes false.
    * (Corpus claim that unknown keys admit everything is overruled.)
    * */
    const cpFilter = new ChannelPayloadFilter({ someMetaKey: 'anything' })
    const payloadBool = cpFilter({
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: { eventType: 'menuDrawer' },
      srcElement: getSrcElement()
    })

    expect(payloadBool).to.be.false
  })

  it('a selector criterion with no srcElement present fails closed [admit-by-payload-filter]', () => {
    const cpFilter = new ChannelPayloadFilter('.flt-item')
    const payloadBool = cpFilter({
      action: 'CHANNEL_MY_FETCH_EVENT',
      payload: { rows: [] }
    })
    expect(payloadBool).to.be.false
  })

  it('debugLabel does not affect matching [admit-by-payload-filter]', () => {
    const plainFilter = new ChannelPayloadFilter({ payload: (p) => p.eventType === 'menuDrawer' })
    const labeledFilter = new ChannelPayloadFilter({
      payload: (p) => p.eventType === 'menuDrawer',
      debugLabel: 'semanticsTest'
    })
    const payloadObj = {
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: { eventType: 'menuDrawer' },
      srcElement: getSrcElement()
    }
    expect(labeledFilter(payloadObj)).to.equal(plainFilter(payloadObj))
  })

  it('two-arg constructor form (selector, filtersObj) applies both criteria [admit-by-payload-filter]', () => {
    const cpFilter = new ChannelPayloadFilter('.flt-item', { payload: (p) => p.ok === true })
    const bothPassBool = cpFilter({
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: { ok: true },
      srcElement: getSrcElement()
    })
    const payloadFailsBool = cpFilter({
      action: 'CHANNEL_UI_CLICK_EVENT',
      payload: { ok: false },
      srcElement: getSrcElement()
    })
    expect(bothPassBool).to.be.true
    expect(payloadFailsBool).to.be.false
  })
})
