const {expect, assert} = require('chai');
import {SpynePluginsMethods} from '../../spyne/utils/spyne-plugins-methods';



const spynePluginMethods = new SpynePluginsMethods();


const methodsObj = {
  myFn1: ()=>{
    return 'first method value'
  },

  myFn2: ()=>{
    return 'second method vaue'
  }

}

const dupeMethods = {

  myFn1: ()=>{
    return 'this is a dupe method'
  },

  myFn4: ()=>{
    return 'second method vaue'
  }



}


const methodsObjWrong = {
  myStr1: "This should be a valid method.",

  myFn3: ()=>{
    return 'second method vaue'
  }
}




const methodsArr = [
  {
    myFn1: ()=>{
      return 'first method value'
    }
  }
]



//console.log('plugin methods1 is ',{spynePluginMethods})

describe('should test spyne plugins methods', () => {

  it('should test that SpynePluginsMethods exists', () => {

    expect(spynePluginMethods).to.exist;

  });

  it('should get the plugin object', ()=>{
   const pluginsMethodObj = spynePluginMethods.pluginMethodsObj
    expect(pluginsMethodObj).to.be.an('object');

  })

  it('should check if methodsObj is valid obj', ()=>{
    const warnStr = spynePluginMethods.addMethods(methodsArr, true);
    expect(warnStr).to.be.a('string');
  })

  it('should return error for non method vals', ()=>{
    const warnStr = spynePluginMethods.addMethods(methodsObjWrong, true);
    expect(warnStr).to.be.a('string');
  })



  it('should add methods from key value pairs', ()=>{

    spynePluginMethods.addMethods(methodsObj);

    const pluginMethodsObj = spynePluginMethods.pluginMethodsObj;
    const firstMethodVal =pluginMethodsObj.myFn1()
    expect(firstMethodVal).to.equal(methodsObj.myFn1());

  })


  it('should capture already created methods', ()=>{

    const warnStr = spynePluginMethods.addMethods(dupeMethods, true);
    expect(warnStr).to.be.a('string');

  })


});
