import {getAllMethodNames} from '../utils/frp-tools';
const R = require('ramda');

export class ViewStreamEnhancer {
  constructor(parentViewStream) {
    this.parentViewStream = parentViewStream;
    this.omittedMethods = [
      'autoBinder',
      'initAutoBinder',
      'getEnhancerMethods',
      'bindParentViewStream'];
  }

  initAutoBinder() {
    this.autoBinder();
  }

  getEnhancerMethods() {
    return getAllMethodNames(this, this.omittedMethods);
  }

  bindParentViewStream(methodsObj, context) {
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
