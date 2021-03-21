import {ChannelDataPacket} from './channel-data-packet';
import {keys, compose, map} from 'ramda';

export class ChannelDataPacketGenerator {

  constructor() {


    this._packetMap = new Map();

    //console.log('data packet controller constructor ',this._packetMap);


  }

  createDataPacket(data={}){
    const packedData = data;

    const timestamp = ChannelDataPacketGenerator.createTimeStamp();
    const label = ChannelDataPacketGenerator.createLabel();
    this._packetMap.set(label, packedData);





  }

  static createAllPassFilterGateway(){


  }

  static createFilterGateway(label, map=this._packetMap){
    return (pred)=>{
      if (typeof(pred)==='function'){
        try {
          return pred(map.get(label));
        } catch(e){
          console.log('predicate not working -> ',e);
        }
      }

      return false;
    }

  }

  static createUnpackedDataArr(data){

    return keys(data);
  }


  static createLabel(){
    return `packet_${Math.random().toString(36).replace(/\d/gm, '').substring(1,8)}`;
  }

  static createTimeStamp(){
    return Date.now();
  }



  static createPacketUnpacker(){

  }


}
