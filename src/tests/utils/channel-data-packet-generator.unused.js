const {expect, assert} = require('chai');
const R = require('ramda');
import {ChannelPayloadToTestFilters} from '../mocks/channel-payload-data';
import {ChannelDataPacketGenerator} from '../../spyne/utils/channel-data-packet-generator';
import {ChannelDataPacket} from '../../spyne/utils/channel-data-packet';

describe('should test the ChannelDataPacketGenerator', () => {

  it('should test the packet geneator', () => {

    const packetGenerator = new ChannelDataPacketGenerator();

    //console.log('packet gen is ',{ChannelPayloadToTestFilters})


    return true;

  });

  it('should create a custom label for the map location', ()=>{
    const packetLabel = ChannelDataPacketGenerator.createLabel();
    const isValidString = /^(\w)+$/.test(packetLabel);
    expect(isValidString).to.be.true;
  })

  it('should create a timestamp',()=>{
    const timestamp = ChannelDataPacketGenerator.createTimeStamp();
    expect(timestamp).to.be.a('number');
  })

  it('should create an empty unpacked data file', ()=>{
    const unpackedDataArr = ChannelDataPacketGenerator.createUnpackedDataArr(ChannelPayloadToTestFilters);
    expect(unpackedDataArr).to.be.a('array');
  })

  it('should allow for predicate test filter on packed data ',()=>{
    const map = new Map();
    const label = ChannelDataPacketGenerator.createLabel();
    map.set(label, ChannelPayloadToTestFilters);

    const filterGateway = ChannelDataPacketGenerator.createFilterGateway(label, map);
    const pred = R.propEq('CHANNEL_ROUTE_CHANGE_EVENT', 'action');

    const isCorrectAction = filterGateway(pred)

    expect(isCorrectAction).to.be.true;

  })

  it('should create data packet ',()=>{
    const channelDataPacketGen = new ChannelDataPacketGenerator();

    console.time('initPacket');
    const channelDataPacket = channelDataPacketGen.createDataPacket(ChannelPayloadToTestFilters, ['channelName', 'action']);
      //console.log('channel data packet ',channelDataPacket.props)
    console.timeEnd('initPacket');

    //console.log("CHANNEL DATA ALL ",channelDataPacket);
    channelDataPacket.unPacked = true;
    //console.log("CHANNEL DATA ALL 2 ",channelDataPacket.srcElement);


    return true;


  })



  it('should create a stripped down unpacked data obj', ()=>{

      var obj = {
        'type' :  'dog',
        'says' : 'woof'
      }

      var obj2 = {
        'type' : 'cat',
        'says' : 'meow',
        '_unpacked' : false,
        'loc' : 'dog'



      }

      Object.defineProperty(obj2, 'unpacked', {

        get: ()=>obj2._unpacked,
        set: (b) => {
          if(b===true){
            obj2.type = window[obj2.loc].type;
            obj2.says = window[obj2.loc].says;
            obj2._unpacked = b;
          }


        }


      })

    window['dog'] = obj;


      //console.log(' both objs is ',window.dog, obj2);
      obj2.unpacked = true;
   // console.log(' both objs is ',window.dog, obj2);


      return true;

  })





});
