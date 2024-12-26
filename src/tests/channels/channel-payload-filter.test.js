import { ChannelPayloadToTestFilters } from '../mocks/channel-payload-data'
import { ChannelPayloadFilter } from '../../spyne/utils/channel-payload-filter'
import { ChannelPayload } from '../../spyne/channels/channel-payload-class'
import { SpyneApp } from '../../spyne/spyne'
const { expect, assert } = require('chai')

const R = require('ramda')
describe('should test channel payload filters parameter configuration', () => {
  beforeEach(function() {
    // runs once before the first test in this block
    window.Spyne = {
      config : {
        debug : false
      }
    }
  })

  const testModeBool = true

  it('should throw an error if cp filter is empty', () => {
    const cpFilter = new ChannelPayloadFilter(undefined, undefined, undefined, true)
    const { filtersAreEmpty } = cpFilter
    expect(filtersAreEmpty).to.be.true
  })

  it('should filter selector string only', () => {
    const cpFilter = new ChannelPayloadFilter('.my-selector')
    expect(cpFilter).to.be.a('function')
  })

  it('should filter selector string only but with testMode param', () => {
    const mySelector = '.my-selector'
    const cpFilter = new ChannelPayloadFilter(mySelector, {}, false, testModeBool)
    const { testMode, selector } = cpFilter
    const correctVals = {
      selector: mySelector,
      testMode: testModeBool
    }
    expect({ testMode, selector }).to.deep.equal(correctVals)
  })

  it('should filter selector string and testMode param in filters', () => {
    const mySelector = '.my-selector'
    const cpFilter = new ChannelPayloadFilter({ selector:mySelector, testMode:testModeBool })
    const { testMode, selector } = cpFilter
    const correctVals = {
      selector: mySelector,
      testMode: testModeBool
    }
    expect({ testMode, selector }).to.deep.equal(correctVals)
  })

  it('should add debugLabel as prop in filters', () => {
    const mySelector = '.my-selector'
    const cpFilter = new ChannelPayloadFilter({ debugLabel: 'myTest', testMode:testModeBool })
    const { debugLabel } = cpFilter
    expect(debugLabel).to.equal('myTest')
  })

  it('should filter selector array only', () => {
    const mySelector = ['.my-selector', '#my-button', '#my-el.tester > li']
    const cpFilter = new ChannelPayloadFilter(mySelector, {}, 'myTest', testModeBool)
    const { testMode, selector } = cpFilter
    const correctVals = {
      selector: mySelector,
      testMode: testModeBool
    }
    expect({ testMode, selector }).to.deep.equal(correctVals)
  })

  it('should filter selector array only as prop in filters', () => {
    const mySelector = ['.my-selector', '#my-button', '#my-el.tester > li']
    const cpFilter = new ChannelPayloadFilter({ selector:mySelector, debugLabel:'myTest', testMode: testModeBool }, 'notCorrect', false, false)
    const { selector } = cpFilter
    expect(selector).to.equal(mySelector)
  })

  it('should filter properties only by multiple params', () => {
    const myProps = {
      action: 'CHANNEL_MYCHANNEL_MAIN_EVENT',
      myPropFn: (v) => v >= 30
    }
    const cpFilter = new ChannelPayloadFilter(undefined, myProps, 'myval', true)
    const myPropFn = R.path(['propFilters', 'myPropFn'], cpFilter)
    expect(myPropFn).to.be.a('function')
  })

  it('should filter properties only one object param', () => {
    const myProps = {
      action: 'CHANNEL_MYCHANNEL_MAIN_EVENT',
      myPropFn: (v) => v >= 30,
      testMode: testModeBool
    }
    const cpFilter = new ChannelPayloadFilter(myProps)
    const myPropFn = R.path(['propFilters', 'myPropFn'], cpFilter)
    expect(myPropFn).to.be.a('function')
  })
})

describe('should test channel payload filters boolean correctness', () => {
  const liSel = '#xqdlqmr'
  // const spyneApp = SpyneApp;

  beforeEach(function() {
    SpyneApp.init({ debug:true }, true)

    const liElTmpl = `
     <li class="page-card page-menu-4-card" id="xqdlqmr" name="PageCardView" data-vsid="xqdlqmr"><a href="/menu-3/sub-menu-4" data-channel="ROUTE" data-event-prevent-default="true" data-topic-id="sub-menu-2" data-nav-level="2">
        <dl class="card-content">
          <dt class="card-image">
          </dt>
          <dd class="card-text">
            <h2>SUB-MENU-2</h2>
             <p>Lorem ipsum dolor sit </p>
          </dd>
        </dl>
      </li>   
    `

    const ul = document.createElement('ul')
    ul.innerHTML = liElTmpl
    document.body.appendChild(ul)

    ChannelPayloadToTestFilters.srcElement.el = document.querySelector(liSel)
  })

  it('should find the selector string ', () => {
    const cpFilter = new ChannelPayloadFilter(liSel)
    const payloadBool = cpFilter(ChannelPayloadToTestFilters)
    expect(payloadBool).to.be.true
  })

  it('should detect the wrong selector string ', () => {
    const cpFilter = new ChannelPayloadFilter('#mysel')
    const payloadBool = cpFilter(ChannelPayloadToTestFilters)
    expect(payloadBool).to.be.false
  })

  it('should detect the selector from an array ', () => {
    const cpFilter = new ChannelPayloadFilter([liSel, 'ul', 'li.test'])
    const payloadBool = cpFilter(ChannelPayloadToTestFilters)
    expect(payloadBool).to.be.true
  })

  it('should detect the wrong selector from an array ', () => {
    const cpFilter = new ChannelPayloadFilter(['dd', 'dt', 'ul', 'li.test'])
    const payloadBool = cpFilter(ChannelPayloadToTestFilters)
    expect(payloadBool).to.be.false
  })

  it('should find the selector from filters', () => {
    const selector = liSel
    const cpFilter = new ChannelPayloadFilter({ selector })
    const payloadBool = cpFilter(ChannelPayloadToTestFilters)

    expect(payloadBool).to.be.true
  })

  it('should detect the  selector from an array in filters ', () => {
    const selector = ['dd', 'dt', 'ul', liSel, 'li.test']
    const cpFilter = new ChannelPayloadFilter({ selector })
    const payloadBool = cpFilter(ChannelPayloadToTestFilters)
    expect(payloadBool).to.be.true
  })

  it('should detect the selector from an array and destructured prop in filters ', () => {
    const selector = ['dd', 'dt', 'ul', liSel, 'li.test']
    const pageId = (v) => /menu-\d/.test(v)
    const cpFilter = new ChannelPayloadFilter({ selector, pageId })
    const payloadBool = cpFilter(ChannelPayloadToTestFilters)
    expect(payloadBool).to.be.true
  })

  it('should detect the selector from an array and routeValue prop in filters ', () => {
    const selector = ['dd', 'dt', 'ul', liSel, 'li.test']
    const re = /menu-\d/
    const payload =  R.compose(R.test(re), R.path(['routeData', 'pageId']))
    const cpFilter = new ChannelPayloadFilter({ selector, payload })
    const payloadBool = cpFilter(ChannelPayloadToTestFilters)
    expect(payloadBool).to.be.true
  })

  it('should detect the selector from an array and multiple props in filters ', () => {
    const selector = [liSel, 'dd', 'dt', 'ul', 'li.test']
    const re = /menu-\d/
    const action = 'CHANNEL_ROUTE_CHANGE_EVENT'
    const payload =  R.compose(R.test(re), R.path(['routeData', 'pageId']))
    const cpFilter = new ChannelPayloadFilter({ selector, payload, action })
    const payloadBool = cpFilter(ChannelPayloadToTestFilters)
    expect(payloadBool).to.be.true

    return true
  })
})

describe('it should test channel payload filter with data packer ', () => {
  const liSel = '#xqdlqmr'

  beforeEach(function() {
    SpyneApp.init({ debug:true }, true)

    const liElTmpl = `
     <li class="page-card page-menu-4-card" id="xqdlqmr" name="PageCardView" data-vsid="xqdlqmr"><a href="/menu-3/sub-menu-4" data-channel="ROUTE" data-event-prevent-default="true" data-topic-id="sub-menu-2" data-nav-level="2">
        <dl class="card-content">
          <dt class="card-image">
          </dt>
          <dd class="card-text">
            <h2>SUB-MENU-2</h2>
             <p>Lorem ipsum dolor sit </p>
          </dd>
        </dl>
      </li>   
    `

    const ul = document.createElement('ul')
    ul.innerHTML = liElTmpl
    document.body.appendChild(ul)

    ChannelPayloadToTestFilters.el = document.querySelector(liSel)
  })

  it('should test regular channel payload ', () => {
    const { action, channelName, srcElement, payload } = ChannelPayloadToTestFilters
    // console.log('spyne is is ',{action, channelName, srcElement, payload});
    const re = /menu-\d/
    const actionCompare = 'CHANNEL_ROUTE_CHANGE_EVENT'
    const payloadCompare =  R.compose(R.test(re), R.path(['routeData', 'pageId']))
    const cpFilter = new ChannelPayloadFilter({ payload:payloadCompare, action:actionCompare })

    const channelPayload = new ChannelPayload(channelName, action, payload, srcElement, {})

    const payloadBool = cpFilter(channelPayload)

    // console.log('payload bool base is ',payloadBool);

    return true
  })
})
