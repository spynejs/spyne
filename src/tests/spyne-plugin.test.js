//import {SpyneApp} from '../spyne/spyne';
//const {SpyneApp} = require('../spyne/spyne');
const {expect, assert} = require('chai');
const {SpynePlugin} = require('../spyne/spyne-plugins.js');

const name = 'mySpynePlugin';
const config = {debug:true};

describe('should test use of spyne plugin', () => {
  const baseConfig = {debug:false};
  beforeEach(()=>{


  })


  it('spyne plugin should exist', () => {
    //console.log('spyne plugin1  is ',spyneApp);

    return true;
  // expect(SpynePlugin).to.exist;

  });

/*
  it('should get or create new spyne app', ()=>{
    const spyneApp = SpynePlugin.getSpyneApp({name, config})
     console.log("HERE IS ",{name, config, spyneApp})

    //console.log('spune app is ',spyneApp.constructor.name)
    expect(spyneApp.constructor.name).to.equal('SpyneApp');
  })

*/

/*  it('should set the plugin name', ()=>{
    const spynePluginSetConfig =  SpynePlugin.updateSpyneConfig(spyneApp, name, config);

   expect(spynePluginSetConfig).to.deep.equal(config);

  })

  it('should check if spyne plugin name already exists', ()=>{
    const config1 =  SpynePlugin.updateSpyneConfig(spyneApp, name, config);
    const configDupe =  SpynePlugin.updateSpyneConfig(spyneApp, name, config);
    expect(configDupe).to.be.false;
  })*/

});
