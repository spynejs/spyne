const {expect, assert} = require('chai');
import {Channel, SpyneAppProperties} from '../../spyne/spyne';
const {SpyneApp} = require('../../spyne/spyne-app');


describe('should test channel instance', () => {
  const channelName = "CHANNEL_MYTEST_CHANNEL";
  SpyneApp.registerChannel(new Channel(channelName))

  before(function(){


  })


  it('registered channel should exist', () => {
      const channelExists = SpyneAppProperties.channelsMap.testStream(channelName)
      expect(channelExists).to.be.true;
  });

  it('should create default data action when data is added and no actions set', ()=>{
    let channelProps = {sendCachedPayload:false, name:channelName,  data: {foo:'bar'}}
    let emptyActionsObj = {};

    const {props, actionsObj} = Channel.checkForPersistentDataMode(channelProps, emptyActionsObj);

    const finalActionsObj = {
      CHANNEL_MYTEST_CHANNEL_EVENT: 'CHANNEL_MYTEST_CHANNEL_EVENT'
    }

    expect(props.sendCachedPayload).to.be.true;
    expect(actionsObj).to.deep.equal(finalActionsObj);

  })

  it('should update SpyneAppProperties doNotTrackList if doNotTrack is true', ()=>{
    const channelName="CHANNEL_MY_TEST_CHANNEL";
    const doNotTrack = true;
    Channel.checkForNotTrackFlag({channelName, doNotTrack});
    const untrackedChannelsArr = SpyneAppProperties.getUntrackedChannelsList()
    expect(untrackedChannelsArr).to.deep.eq([channelName]);
  })

});
