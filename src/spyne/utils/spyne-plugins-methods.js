const _pluginMethodsObj = Object.create({});

_pluginMethodsObj['foo'] = ()=>console.log("used for testing purposes.");

import {allPass, compose, is, isEmpty, keys, not, prop} from 'ramda';


const isNotArr = compose(not, is(Array));
const isNotEmpty = compose(not, isEmpty);
const isNonEmptyStr = allPass([is(String), isNotEmpty]);
const isNonEmptyArr = allPass([is(Array), isNotEmpty]);
const isObjectFn = compose(allPass([isNotArr, is(Object)]))
const isNonEmptyObjectFn = compose(allPass([isNotEmpty, isNotArr, is(Object)]))


export class SpynePluginsMethods{


  constructor(){



  }



  addMethod(key, fn, test=false){
    //console.log('has method is 2',typeof(_pluginMethodsObj),{_pluginMethodsObj})

    if (_pluginMethodsObj.hasOwnProperty(key)===true){
      const warnStr = `Spyne Warning: the method name, ${key}, already exists.`;

      if (test){
        return warnStr;
      }
      console.warn(warnStr);
    } else {
      _pluginMethodsObj[key] = fn;
    }

  }


  addMethods(methodsObj={}, test=false){

    let warnStr;

    const isObj = isObjectFn(methodsObj);

    if (isObj === false){
      warnStr = `Spyne Warning: the pluginMethods property, ${JSON.stringify(methodsObj)} needs to be an object.`
      if (test){
        //console.log('this is a test ',{methodsObj})
        return warnStr;
      }
      console.warn(warnStr);
      return;

    }

    const checkEachKeyForValidMethod = (keyStr) => {
      const methodVal = prop(keyStr, methodsObj);

      const isFunction = typeof(methodVal) === 'function';

      //console.log('method to add ',{keyStr, isFunction})

      if (isFunction){
        this.addMethod(keyStr, methodVal, test);
      } else{
        warnStr = `the value for ${keyStr} is not a valid function.`
        if (test){
          return warnStr;
        } else {
          console.warn(warnStr);
        }
      }

    }

    const methodKeys = keys(methodsObj);

    return methodKeys.map(checkEachKeyForValidMethod).join(',');

  }

  checkIfMethodExists(key){

  }

  test1(){
    //console.log('test 1 is ');
  }


  get pluginMethodsObj(){
    return _pluginMethodsObj;
  }






}
