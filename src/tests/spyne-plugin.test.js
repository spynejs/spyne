import {SpyneApp} from '../spyne/spyne';

const {expect, assert} = require('chai');
const {SpynePlugin} = require('../spyne/spyne-plugins');

const spynePluginName = 'mySpynePlugin';
const spynePluginConfig = {debug:true};

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
    const spyneApp = SpynePlugin.getSpyneApp(spynePluginName, spynePluginConfig)
    //console.log('spune app is ',spyneApp.constructor.name)
    expect(spyneApp.constructor.name).to.equal('SpyneApp');
  })


  it('should set the plugin name', ()=>{
    const spynePluginSetConfig =  SpynePlugin.updateSpyneConfig(spyneApp, spynePluginName, spynePluginConfig);

   expect(spynePluginSetConfig).to.deep.equal(spynePluginConfig);

  })

  it('should check if spyne plugin name already exists', ()=>{
    const spynePluginConfig1 =  SpynePlugin.updateSpyneConfig(spyneApp, spynePluginName, spynePluginConfig);
    const spynePluginConfigDupe =  SpynePlugin.updateSpyneConfig(spyneApp, spynePluginName, spynePluginConfig);
    expect(spynePluginConfigDupe).to.be.false;
  })

});
