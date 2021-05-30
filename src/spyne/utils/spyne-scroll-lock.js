export class SpyneScrollLock {

  /**
   * @module SpyneScrollLock
   * @type core
   * @desc
   * Channel Window utility that handles locking body scroll.
   *
   * @constructor
   * @param {Number} x - = 0; Window scroll X position.
   * @param {Number} y - = 0; Window scroll Y position.
   *
   */


  constructor(x=window.scrollX,y=window.scrollY) {
    this.scrollX = x;
    this.scrollY = y;
    this.scrollLocked = false;
    this.scrollElement = undefined;
    this.defaultScrollState = SpyneScrollLock.getDefaultScrollState();
    /**
     * TODO: GET IOS BOOL -- check window height in IOS and adjust
     *
     *
     * */


  }

  static getDefaultOverflow(){
     return window.getComputedStyle(document.body)['overflow'];
  }

  static getDefaultPosition(){
    return window.getComputedStyle(document.body)['position'];

  }

  static getDefaultTop(){
    return window.getComputedStyle(document.body)['top'];

  }

  static getDefaultBodyTop(){
    return window.getComputedStyle(document.body)['top'];

  }

  static getDefaultScrollState(){
    return {
      position: SpyneScrollLock.getDefaultPosition(),
      overflow: SpyneScrollLock.getDefaultOverflow(),
      top: SpyneScrollLock.getDefaultTop(),
      x: window.scrollX,
      y: window.scrollY
    }
  }



  setScroll(x=window.scrollX,y=window.scrollY){
      this.scrollX = x;
      this.scrollY = y;


  }

  disableBodyScroll(){


   // this.defaultBodyOverflow = SpyneScrollLock.getDefaultOverflow();
    this.defaultScrollState = SpyneScrollLock.getDefaultScrollState();
    const {y} = this.defaultScrollState;
    const bodyTopPos = `${y*-1}px`;

    console.log('disable body scroll ', this.defaultScrollState, bodyTopPos)
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = bodyTopPos;



  }

  enableBodyScroll(){
    const {position, overflow, top, x, y} = this.defaultScrollState;

    console.log('Enable body scroll ', this.defaultScrollState)

    document.body.style.overflow = overflow;
    document.body.style.position = position;
    document.body.style.top = top;
    window.scrollTo(x,y);

  }




}
