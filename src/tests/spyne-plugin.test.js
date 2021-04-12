import {SpyneApp} from '../spyne/spyne';

const {expect, assert} = require('chai');
const {SpynePlugin} = require('../spyne/spyne-plugins');

const name = 'mySpynePlugin';
const config = {debug:true};

describe('should test use of spyne plugin', () => {
  let spyneApp;
  const baseConfig = {debug:false};
  beforeEach(()=>{

    spyneApp = new SpyneApp(baseConfig)

  })


  it('spyne plugin should exist', () => {
    //console.log('spyne plugin  is ',spyneApp);
   expect(SpynePlugin).to.exist;

  });

  it('should get or create new spyne app', ()=>{
    const spyneApp = SpynePlugin.getSpyneApp({name, config})
    //console.log('spune app is ',spyneApp.constructor.name)
    expect(spyneApp.constructor.name).to.equal('SpyneApp');
  })


  it('should set the plugin name', ()=>{
    const spynePluginSetConfig =  SpynePlugin.updateSpyneConfig(spyneApp, name, config);

   expect(spynePluginSetConfig).to.deep.equal(config);

  })

  it('should check if spyne plugin name already exists', ()=>{
    const config1 =  SpynePlugin.updateSpyneConfig(spyneApp, name, config);
    const configDupe =  SpynePlugin.updateSpyneConfig(spyneApp, name, config);
    expect(configDupe).to.be.false;
  })

});
