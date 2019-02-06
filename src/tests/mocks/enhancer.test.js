import {SpyneTrait} from '../../spyne/views/spyne-trait';

export class Enhancer extends SpyneTrait {
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
