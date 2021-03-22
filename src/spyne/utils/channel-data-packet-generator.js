import {ChannelDataPacket} from './channel-data-packet';
import {
  keys,
  compose,
  pick,
  mergeAll,
  map,
  ifElse,
  prop,
  invoker,
  identity,
} from 'ramda';

export class ChannelDataPacketGenerator {

  constructor() {


    this._packetMap = new Map();
    this._iter = 0;
    this.createFilterGateway = ChannelDataPacketGenerator.createFilterGateway.bind(this);

    //console.log('data packet controller constructor ',this._packetMap);


  }

  createDataPacket(data={}, exposedPropsArr=[]){
    const _packedData = data;
    const label = ChannelDataPacketGenerator.createLabel();
    this._packetMap.set(label, _packedData);

    const _packedDataKeys = keys(data);
    const isPacket = true;
    const _unPacked = false;
    const timestamp = ChannelDataPacketGenerator.createTimeStamp();

    const filterGateway = this.createFilterGateway(data);
    const reduceProps = (acc={}, k) => {
      acc[k] = _packedData[k];
      return acc;
    }
    const baseProps = exposedPropsArr.reduce(reduceProps, {});

      //console.log('base props ',{baseProps})

       // const baseProps = pick(exposedPropsArr, data);
        const channelDataPacket = mergeAll([{timestamp, label, filterGateway}, baseProps]);

    const ifElseFn =  ifElse(prop('props'), invoker(0, 'props'), identity);

    const getProps = () => {
        return ifElseFn(this._packetMap.get(label));
    }

    const addBackValuesToKeys = ()=> {
      const data = this._packetMap.get(label);
      const addValues = (k)=>{
        //console.log('k value is ',{k})
        channelDataPacket[k] = data[k];
      }

      _packedDataKeys.forEach(addValues);
    }

    const onSetUnpacked = (b)=>{
      if (b===true){
        addBackValuesToKeys();
      }
    }



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


  static createLabel() {
    this._iter++;
    return `packet_num_${this._iter}`;
  }

  static createTimeStamp(){
    return Date.now();
  }



  static createPacketUnpacker(){

  }


}
