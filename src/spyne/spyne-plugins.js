import {SpyneApp} from './spyne';

export class SpynePlugin {

  constructor(config) {

    if(window && window.Spyne){
      return window.Spyne;
    } else {
      return new SpyneApp(config);

    }


    //super(config);


  }



}
