const {expect, assert} = require('chai');
const MSFData = require('../mocks/msf-user-data.json');
const MSFDataSmall = require('../mocks/msf-user-data-small.json');
import {SpyneApp, Channel} from '../../spyne/spyne';
import {ChannelPayload} from '../../spyne/channels/channel-payload-class'
import {ChannelPayloadToTestFilters} from '../mocks/channel-payload-data';
import {ChannelPayloadFilter} from '../../spyne/utils/channel-payload-filter';
const R = require('ramda');


describe('should test Channel Payload Class', () => {
  const {srcElement, event, action} = ChannelPayloadToTestFilters;
  const channelName = "CHANNEL_ROUTE";

  beforeEach(()=>{

    const spyneApp = new SpyneApp({debug:true})

    spyneApp.registerChannel(new Channel("CHANNEL_MYCHANNEL"))


  })

  it('should freeze the payload', ()=>{
    const channnelPayload = new ChannelPayload(channelName, action, MSFData, srcElement, event)
    const {payload} = channnelPayload;
    let {section} = payload.content;
    let payloadIsFrozen = false;
    try{
      section.header = 'new copy';
    } catch(e){
      payloadIsFrozen = true;
    }

    //console.log('payload is ', {payloadIsFrozen, section});

    expect(payloadIsFrozen).to.be.true;
  })

  it('should clone and unfreeze the props payload', ()=>{
    const channnelPayload = new ChannelPayload(channelName, action, MSFData, srcElement, event)
    const {payload, channel} = channnelPayload.props();
    let {section} = payload.content;
    let payloadPropsIsClone = true;
    try{
      section.header = 'new copy';
    } catch(e){
      payloadPropsIsClone = false;
    }

    console.log('payload props is ', {payloadPropsIsClone,channel, section});

    expect(payloadPropsIsClone).to.be.true;
  })
  it('should clone and unfreeze the deconstructed props payload', ()=>{
    const channnelPayload = new ChannelPayload(channelName, action, MSFData, srcElement, event)
    const {content} = channnelPayload.props();
    let {section} = content;
    let payloadPropsIsClone = true;
    try{
      section.header = 'new copy';
    } catch(e){
      payloadPropsIsClone = false;
    }

    //console.log('payload props DECON is ', {payloadPropsIsClone, section});

    expect(payloadPropsIsClone).to.be.true;
  })

  it('should clone and unfreeze the updated new prop', ()=>{
    const channnelPayload = new ChannelPayload(channelName, action, MSFData, srcElement, event)
    const {payload, channel} = channnelPayload.props();
    let {section} = payload.content;
    let payloadPropsIsClone = true;
    try{
      section.linksData = {foo:'bar'};
      section.linksData = {foo:3};
    } catch(e){
      payloadPropsIsClone = false;
    }

    console.log('payload props2 is ', {payloadPropsIsClone,channel, section}, section.linksData);

    expect(payloadPropsIsClone).to.be.true;
  })




  it('should run shell tests', () => {


    const channnelPayload = new ChannelPayload(channelName, action, MSFData, srcElement, event)
    const getVals = (e)=>{
      let {payload} = e;
      let {content} = payload;
      //content['ubu']=4;
      console.log('channel FROZE payload class ',content)

    }

    const getValsFromProps = (e)=>{
      console.time("propsPairs");
      let {payload} = e.props();
      console.timeEnd('propsPairs');
      let {section} = payload.content;

     // section['ubu']=4;
      console.log('channel PROPS payload class ',section)
    }

    //getVals(channnelPayload);
    //getValsFromProps(channnelPayload);


    //console.log('channel payload class ',window.Spyne.config.channels[channelName].payload[1].payload.isDeepLink)

    return true;

  });

});
