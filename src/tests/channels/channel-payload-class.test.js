const {expect, assert} = require('chai');
import {SpyneApp, Channel} from '../../spyne/spyne';
import {ChannelPayload} from '../../spyne/channels/channel-payload-class'
import {ChannelPayloadToTestFilters} from '../mocks/channel-payload-data';
import {ChannelPayloadFilter} from '../../spyne/utils/channel-payload-filter';
const R = require('ramda');


describe('should test Channel Payload Class', () => {
  beforeEach(()=>{

    const spyneApp = new SpyneApp({debug:true})

    spyneApp.registerChannel(new Channel("CHANNEL_MYCHANNEL"))


  })


  it('should run shell tests', () => {

    const channelName = "CHANNEL_ROUTE";
    const {payload, srcElement, event, props, action} = ChannelPayloadToTestFilters;

    const channnelPayload = new ChannelPayload(channelName, action, payload, srcElement, event)



    //console.log('channel payload class ',channnelPayload.props())
    //console.log('channel payload class ',window.Spyne.config.channels[channelName].payload[1].payload.isDeepLink)

    return true;

  });

});