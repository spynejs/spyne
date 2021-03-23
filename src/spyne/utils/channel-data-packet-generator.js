import {ChannelDataPacket} from './channel-data-packet';
import {deepMerge} from './deep-merge';
import {
  keys,
  compose,
  pick,
  mergeAll,
    reject,
    omit,
  map,
    path,
  clone,
  ifElse,
  prop,
  invoker,
  identity,
} from 'ramda';

export class ChannelDataPacketGenerator {

  constructor() {


    this._packetMap = new Map();
   // this._packetObj = {};
    this._iter = 0;
    this.createFilterGateway = ChannelDataPacketGenerator.createFilterGateway.bind(this);

    //console.log('data packet controller constructor ',this._packetMap);
    this.createDataPacket = ChannelDataPacketGenerator.createDataPacket.bind(this);
    this.createLabel = ChannelDataPacketGenerator.createLabel.bind(this);

  }

  static deepFreeze(o) {
    try {
      Object.freeze(o);
      Object.getOwnPropertyNames(o).forEach(function(prop) {
        if (o.hasOwnProperty(prop)
            && o[prop] !== null
            && (typeof o[prop] === "object" || typeof o[prop] === "function")
            && !Object.isFrozen(o[prop])) {
          ChannelDataPacketGenerator.deepFreeze(o[prop]);
        }
      });

    } catch(e){
     // console.log("FREEZE ERR ",{o,e});
      return o;

    }

    return o;
  }

 static createDataPacket(_packedData={}, exposedPropsArr=[]){

    _packedData =  ChannelDataPacketGenerator.deepFreeze(_packedData);

    //console.log('data packet gen is ',  this)
    const label = this.createLabel();
   //console.time(label);
    //window.spyneTmp[label]=_packedData;//(['payload'], _packedData);
 //  this._packetObj[label]=_packedData;
   const isPacket = true;
    this._packetMap.set(label, _packedData);

    const _packedDataKeys =  compose(keys, omit(['props']))(_packedData);
    //console.log("PACKED KEYS IS ",_packedDataKeys)
    const _unPacked = false;
    const timestamp =  ChannelDataPacketGenerator.createTimeStamp();

    const filterGateway = this.createFilterGateway(_packedData);
   //console.timeEnd(label);

   const reduceProps = (acc={}, k) => {
     if (k ==='props'){
       return acc;
     }

      acc[k] = _packedData[k];
      return acc;
    }

   const baseProps = exposedPropsArr.reduce(reduceProps, {});

      //console.log('base props ',{baseProps})

       // const baseProps = pick(exposedPropsArr, data);

    const ifElseFn =  ifElse(prop('props'), invoker(0, 'props'), identity);

    const props = () => {
        return ifElseFn(this._packetMap.get(label));
    }
   const props2 = () => {
     return  this._packetMap.get(label).props();
   }
    const users = ()=>{
     // return window.spyneTmp[label];
      return this._packetMap.get(label).payload.users;
     // return this._packetObj[label].payload.users;
    }



    const addBackValuesToKeys = ()=> {
      const data = this._packetMap.get(label);
      const addValues = (k)=>{
        //console.log('k value is ',{k},channelDataPacket)
        channelDataPacket[k] = data[k];
      }

      _packedDataKeys.forEach(addValues);
    }

    const onSetUnpacked = (b)=>{
      if (b===true){
        addBackValuesToKeys();
      }
    }


/*

    Object.defineProperties(channelDataPacket, {

      props: {
        get: getProps
      },

      packedData: {
        get: ()=>()=>this._packetMap.get(label)
      },
      unPacked: {
          get: ()=>_unPacked,
          set: onSetUnpacked

      }

        });


*/
   const packedData = ()=>this._packetMap.get(label);
   const unpack = addBackValuesToKeys;

   let obj = Object.create(null);

   let channelDataPacket = mergeAll([{timestamp, label, props,users, isPacket, packedData, unpack, filterGateway}, baseProps]);
    channelDataPacket = deepMerge(channelDataPacket, obj);

    //console.log('packet is ',channelDataPacket);
    return channelDataPacket;

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


  static createLabel(iter=this._iter++) {

    return `packet_num_${this._iter}`;
  }

  static createTimeStamp(){
    return Date.now();
  }



  static createPacketUnpacker(){

  }


}
