//const { expect, assert } = require('chai')
//const { ChannelFetch } = require('../../spyne/channels/channel-fetch-class')
const { expect, assert } = require('chai')
import { ChannelFetch, SpyneApp } from '../../spyne/spyne';

describe('should test ChannelFetch', () => {
  const mapFn = (p) => {
    // console.log('mapping fetched data ', p);
    return p
  }

  const channelName = 'CHANNEL_MY_FETCHED_DATA'
  const url = 'https://jsonplaceholder.typicode.com/posts/1'

  it('should return true for valid mapFn method', () => {
    const props = {
      mapFn,
      url,
      method: 'GET'
    }

    const mapMethodIsValid = ChannelFetch.validateMapMethod(props, channelName)
    // console.log('mapFn method is valid ',{mapMethodIsValid})
    expect(mapMethodIsValid).to.be.true
  })

  it('should return true for valid map method', () => {
    const map = mapFn
    const props = {
      map,
      url,
      method: 'GET'
    }

    const mapMethodIsValid = ChannelFetch.validateMapMethod(props, channelName)
    // console.log('map method is valid ',{mapMethodIsValid})
    expect(mapMethodIsValid).to.be.true
  })

  it('should return true non existing map methods', () => {
    const props = {
      url
    }

    const noMapMethodAdded = ChannelFetch.validateMapMethod(props, channelName)
    // console.log('map methods not added and is valid ',{noMapMethodAdded})
    expect(noMapMethodAdded).to.be.true




  })


  it('should return false for map of wrong type', () => {
    const map = 4
    const props = {
      map,
      url
    }

    const mapTypeIsCorrect = ChannelFetch.validateMapMethod(props, 'MY_TEST_NAME', true)
    // console.log('map methods is not of correct type added and is valid1 ',{mapTypeIsCorrect}) ;     expect(mapTypeIsCorrect).to.be.false;
  })

  it('should return false for mapFn of wrong type', () => {
    const mapFn = 'my str'
    const props = {
      mapFn,
      url
    }

    const mapTypeIsCorrect = ChannelFetch.validateMapMethod(props, 'MY_TEST_NAME_2', true)
    // console.log('map methods is not of correct type added and is valid2 ',{mapTypeIsCorrect}) ;     expect(mapTypeIsCorrect).to.be.false;
  })

  it('should return false for map of wrong type', () => {
    const map = undefined
    const props = {
      map,
      url
    }

    const mapTypeUndefined = ChannelFetch.validateMapMethod(props, 'MY_TEST_NAME', true)
    // console.log('map methods is not of correct type added and is valid3 ',{mapTypeUndefined}) ;     expect(mapTypeUndefined).to.be.false;
  })

  it('should return false for mapFn of wrong type', () => {
    const mapFn = undefined
    const props = {
      mapFn,
      url
    }

    const mapTypeUndefined = ChannelFetch.validateMapMethod(props, 'MY_TEST_NAME_2', true)
    // console.log('map methods is not of correct type added and is valid4 ',{mapTypeUndefined}) ;     expect(mapTypeUndefined).to.be.false;
  })

  describe('conformed error action', () => {
    const createPayloadContext = () => {
      const context = {
        props: { name: channelName },
        sentActions: [],
        createChannelPayloadItem(payload, action) {
          this.sentActions.push({ payload, action })
        }
      }
      return context
    }

    it('should register the generic error action', () => {
      const context = { props: {} }
      const actionsArr = ChannelFetch.prototype.addRegisteredActions.call(context)

      expect(actionsArr).to.include('CHANNEL_ERROR_EVENT')
      expect(actionsArr).to.include('CHANNEL_RESPONSE_EVENT')
    })

    it('should register the instance-derived error action alongside the response action', () => {
      const context = {
        props: {
          extendedActionsArr: [
            `${channelName}_RESPONSE_EVENT`,
            `${channelName}_ERROR_EVENT`,
            [`${channelName}_REQUEST_EVENT`, 'onFetchUpdate']
          ]
        }
      }
      const actionsArr = ChannelFetch.prototype.addRegisteredActions.call(context)

      expect(actionsArr).to.include(`${channelName}_ERROR_EVENT`)
      expect(actionsArr).to.include(`${channelName}_RESPONSE_EVENT`)
    })

    it('should emit the response action for a successful fetch payload', () => {
      const context = createPayloadContext()
      const streamItem = { id: 1, title: 'foo' }

      ChannelFetch.prototype.onFetchReturned.call(context, streamItem)

      expect(context.sentActions[0].action).to.equal(`${channelName}_RESPONSE_EVENT`)
      expect(context.sentActions[0].payload).to.deep.equal(streamItem)
    })

    it('should emit the error action for a conformed fetch error payload', () => {
      const context = createPayloadContext()
      const streamItem = {
        isChannelFetchError: true,
        isError: true,
        error: true,
        errorType: 'FETCH_HTTP_ERROR',
        message: 'Fetch request failed with status 404 Not Found',
        status: 404,
        statusText: 'Not Found',
        url: 'https://jsonplaceholder.typicode.com/posts/does-not-exist'
      }

      ChannelFetch.prototype.onFetchReturned.call(context, streamItem)

      expect(context.sentActions[0].action).to.equal(`${channelName}_ERROR_EVENT`)
      expect(context.sentActions[0].payload).to.deep.equal(streamItem)
    })

    it('should not route a payload to the error action without the discriminator flag', () => {
      const context = createPayloadContext()
      const streamItem = { isError: true, message: 'data that merely resembles an error' }

      ChannelFetch.prototype.onFetchReturned.call(context, streamItem)

      expect(context.sentActions[0].action).to.equal(`${channelName}_RESPONSE_EVENT`)
    })

    it('should add the derived error action to channelActions on a constructed instance', () => {
      SpyneApp.init({})

      const instanceChannelName = 'CHANNEL_FETCH_ERROR_ACTION_TEST'
      const fetchChannel = new ChannelFetch(instanceChannelName, { url, pause: true })

      expect(fetchChannel.channelActions).to.have.property(`${instanceChannelName}_ERROR_EVENT`)
      expect(fetchChannel.channelActions).to.have.property(`${instanceChannelName}_RESPONSE_EVENT`)
      expect(fetchChannel.channelActions).to.have.property(`${instanceChannelName}_REQUEST_EVENT`)
      expect(fetchChannel.channelActions).to.have.property('CHANNEL_ERROR_EVENT')
    })
  })
})
