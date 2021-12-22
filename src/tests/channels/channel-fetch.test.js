const {expect, assert} = require('chai');
const {ChannelFetch} = require('../../spyne/channels/channel-fetch-class')

describe('should test ChannelFetch', () => {
  const mapFn = (p) => {
    //console.log('mapping fetched data ', p);
    return p;
  };

  const channelName = "CHANNEL_MY_FETCHED_DATA"
  let url = 'https://jsonplaceholder.typicode.com/posts/1';


  it('should return true for valid mapFn method', () => {
    let props = {
      mapFn,
      url,
      method: 'GET'
    };

    const mapMethodIsValid = ChannelFetch.validateMapMethod(props, channelName);
    //console.log('mapFn method is valid ',{mapMethodIsValid})
    expect(mapMethodIsValid).to.be.true;

  });

  it('should return true for valid map method', () => {
    const map = mapFn;
    let props = {
      map,
      url,
      method: 'GET'
    };

    const mapMethodIsValid = ChannelFetch.validateMapMethod(props, channelName);
    //console.log('map method is valid ',{mapMethodIsValid})
    expect(mapMethodIsValid).to.be.true;

  });

  it('should return true non existing map methods', () => {
    let props = {
      url
    };

    const noMapMethodAdded = ChannelFetch.validateMapMethod(props, channelName);
    //console.log('map methods not added and is valid ',{noMapMethodAdded})
    expect(noMapMethodAdded).to.be.true;

  });

  it('should return false for map of wrong type', () => {
    const map = 4;
    let props = {
      map,
      url
    };

    const mapTypeIsCorrect = ChannelFetch.validateMapMethod(props, "MY_TEST_NAME", true);
    //console.log('map methods is not of correct type added and is valid1 ',{mapTypeIsCorrect}) ;     expect(mapTypeIsCorrect).to.be.false;

  });

  it('should return false for mapFn of wrong type', () => {
    const mapFn = 'my str';
    let props = {
      mapFn,
      url
    };

    const mapTypeIsCorrect = ChannelFetch.validateMapMethod(props, "MY_TEST_NAME_2", true);
    //console.log('map methods is not of correct type added and is valid2 ',{mapTypeIsCorrect}) ;     expect(mapTypeIsCorrect).to.be.false;

  });

  it('should return false for map of wrong type', () => {
    const map = undefined;
    let props = {
      map,
      url
    };

    const mapTypeUndefined = ChannelFetch.validateMapMethod(props, "MY_TEST_NAME", true);
    //console.log('map methods is not of correct type added and is valid3 ',{mapTypeUndefined}) ;     expect(mapTypeUndefined).to.be.false;

  });

  it('should return false for mapFn of wrong type', () => {
    const mapFn = undefined;
    let props = {
      mapFn,
      url
    };

    const mapTypeUndefined = ChannelFetch.validateMapMethod(props, "MY_TEST_NAME_2", true);
    //console.log('map methods is not of correct type added and is valid4 ',{mapTypeUndefined}) ;     expect(mapTypeUndefined).to.be.false;

  });



});
