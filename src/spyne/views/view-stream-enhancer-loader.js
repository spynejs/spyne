import {getAllMethodNames} from '../utils/frp-tools';

const R = require('ramda');

export class ViewStreamEnhancerLoader {
  constructor(parent, enhancersArr) {
    this.context = parent;
    this.enhancersMap = new Map();
    this.enhancersArr = enhancersArr;

    this.initMap();
    this.addAllEnhancerMethods();
  }

  initMap() {
    this.enhancersMap.set('ALL', []);
    let allMethodsArr = getAllMethodNames(this.context).allMethods;
    this.updateMap('LOCAL', allMethodsArr);
  }

  getEnhancersMap() {
    return this.enhancersMap;
  }

  updateMap(name, arr) {
    let allArr = R.concat(this.enhancersMap.get('ALL'), arr);
    this.enhancersMap.set(name, arr);
    this.enhancersMap.set('ALL', allArr);
  }

  getMethodsArr(str) {
    return this.enhancersMap.get(str);
  }

  createEnhancerMethodsObj(EnhancerClass) {
    const sendError = str => console.error(
      `Spyne Error: The following enhancer method, "${str}", already exists and cannot be added to the ${enhancer.name} Enhancer!`);
    let enhancer = new EnhancerClass(this.context);

    const validateMethods = arr => {
      let methodsExistsFilter = R.contains(R.__, this.getMethodsArr('ALL'));
      let dupedMethods = R.filter(methodsExistsFilter, arr);
      dupedMethods.forEach(sendError);
      return dupedMethods;
    };

    let enhancerMethodsObj = enhancer.getEnhancerMethods();
    let dupedMethodsArr = validateMethods(enhancerMethodsObj.allMethods);
    let dropDupedMethodsFromArr = R.dropWhile(
      R.contains(R.__, dupedMethodsArr));

    enhancerMethodsObj = R.map(dropDupedMethodsFromArr, enhancerMethodsObj);

    this.updateMap(enhancer.name, enhancerMethodsObj.allMethods);

    enhancerMethodsObj['enhancer'] = enhancer;
    enhancerMethodsObj['name'] = enhancer.name;

    return enhancerMethodsObj;
  }

  addAllEnhancerMethods() {
    const addEnhancerMethods = (enhancerClass) => {
      let enhancerMethodsObj = this.createEnhancerMethodsObj(enhancerClass);
      let enhancer = enhancerMethodsObj.enhancer;
      enhancer.bindParentViewStream(enhancerMethodsObj, this.context);
    };

    R.forEach(addEnhancerMethods, this.enhancersArr);
  }
}
