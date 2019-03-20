import { getAllMethodNames } from './frp-tools';
const R = require('ramda');

export class SpyneTrait {
  constructor(parentViewStream, prefix = '', autoInit = true) {
    this.parentViewStream = parentViewStream;
    this.omittedMethods = [
      'autoBinder',
      'initAutoBinder',
      'getEnhancerMethods',
      'checkForMalformedMethods',
      'bindParentViewStream'];

    this.prefix = prefix;

    if (autoInit === true) {
      this.autoBinder();
    }
  }

  initAutoBinder() {
    // this.autoBinder();
  }

  getEnhancerMethods() {
    return getAllMethodNames(this, this.omittedMethods);
  }

  checkForMalformedMethods(methodsArr) {
    if (this.prefix === '') {
      console.warn(`SPYNE WARNING: The following SpyneTrait ${this.constructor.name} needs a prefix`);
      return;
    }
    let reStr = `^(${this.prefix})(.*)$`;
    let re = new RegExp(reStr);

    let malformedMethodsArr = R.reject(R.test(re), methodsArr);
    if (malformedMethodsArr.length >= 1) {
      let warningStr = `Spyne Warning: The following method(s) in ${this.constructor.name} require the prefix, "${this.prefix}": [${malformedMethodsArr.join(', ')}];`;
      console.warn(warningStr);
    }
  }

  bindParentViewStream(methodsObj, context) {
    this.checkForMalformedMethods(methodsObj.allMethods);

    const bindMethodsToParentViewStream = (str, isStatic = false) => {
      const addMethod = s => { context[s] = constructorType[s].bind(context); };
      let constructorType = isStatic === true ? this.constructor : this;
      let propertyType = typeof (constructorType[str]);
      if (propertyType === 'function') {
        addMethod(str);
      }
    };

    const bindCurry = R.curryN(2, bindMethodsToParentViewStream);
    const bindStaticMethodsToParentViewStream = bindCurry(R.__, true);
    R.forEach(bindStaticMethodsToParentViewStream, methodsObj.staticMethods);
    R.forEach(bindMethodsToParentViewStream, methodsObj.methods);
  }

  autoBinder() {
    let allMethods = this.getEnhancerMethods();
    // console.log('all ',allMethods);
    this.bindParentViewStream(allMethods, this.parentViewStream);
  }
}
