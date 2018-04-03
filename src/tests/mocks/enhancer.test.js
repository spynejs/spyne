import {ViewStreamEnhancer} from '../../spyne/views/view-stream-enhancer';

export class Enhancer extends ViewStreamEnhancer {
  constructor(context) {
    super(context);
    this.name = 'TEST';
  }

  testDupeMethod1() {

  }

  getMethodConstructor() {
    return this.constructor.name;
  }

  static getStaticFnConstructor() {
    return this.constructor.name;
  }
}
