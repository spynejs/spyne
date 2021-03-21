export class ChannelDataPacket {

  constructor(details) {
    const {unpacker, filterGateway, keys} = details;


    console.log('create a data packet that can be unpacked')
    this._filterUnpackedData = filterGateway;
    this._windowPacket = data;
    this._packet = keys(data);;
    this._isPacket = true;
    this._unpacked = false;
    this._timeStamp = this.createTimeStamp();
    this._packetLocationArr = [];

  }


  static generateEmptyPacket(){

  }


  static createEmptyPacket(){

  }



  filterPacket(){
    console.log("RUN FILTERED METHOD THROUGH WINDOW OBJECT")

  }

  get packetLocationArr(){
    return this._packetLocationArr;
  }

  set unpacked(bool=false){
    console.log("IF BOOL === true, then clone window reference into packet")

  }





  get isPacket(){
    return true;
  }

  createTimeStamp(){

  }




}
