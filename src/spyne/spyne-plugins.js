import {SpyneApp, ViewStream, DomElement} from './spyne';
import {prop, path, is, pathSatisfies} from 'ramda';
export class SpynePlugin {

  constructor(name, config, parentEl=SpynePlugin.createParentEl()) {
    this.name = name;
    this.props = {};
    this.props.name = name;
    this.props.parentEl = parentEl;
    this.props.spyneApp = SpynePlugin.getSpyneApp(name, config);
    this.onBeforeRegistered();
    this.onRegistered();
    this.onRender();
  }

  onBeforeRegistered(){
    this.props.pluginName = this.props.name;
    this.props.config = path(['Spyne', 'config', 'plugins', this.props.name], window);

  }

  static mergeDefaultConfig(config, defaultConfig=this.defaultConfig()){
    return Object.assign(defaultConfig, config);
  }


  defaultConfig(){

    return {


    }

  }



  static getSpyneApp(name, config){
    const win = window || {};
    let spyneApp = prop('Spyne', win) ;
    const spyneInitialized = typeof(spyneApp) === 'object';
    //console.log('spyne app is ',{spyneApp, spyneInitialized}, typeof(spyneApp));

    spyneApp = spyneInitialized === true ? spyneApp : new spyneApp();

    SpynePlugin.updateSpyneConfig(spyneApp, name, config);

   // spyneApp.config.plugins[name] = config;
    return spyneApp;
  }

  static updateSpyneConfig(spyneApp, pluginName, pluginConfig){
    const pathExists = pathSatisfies(is(Object), ['config', 'plugins', pluginName])(spyneApp);
   // console.log('path exists ',{pathExists}, spyneApp.config.plugins[pluginName])

    if (pathExists===true){
      if (spyneApp.config.debug===true) {
        console.warn(`Spyne Warning: The plugin name, ${pluginName} already exists`)
      }
       return false;
    }
    spyneApp.config.plugins[pluginName] = pluginConfig;
    return spyneApp.config.plugins[pluginName];
  }

  static createParentEl(el){

    const createPluginParentEl = ()=>{
      const pluginEl = document.getElementById('spyne-plugins')

      const createPluginEl = ()=>{
        const pluginEl = new DomElement({
          id: 'spyne-plugins'
        });
        document.body.appendChild(pluginEl.render());
        const el = document.getElementById('spyne-plugins')
        el.style.cssText="position:absolute; top:0;left:0;width:100%;height:100%;min-height:100vh; pointer-events:none";
        return el;
      }
      return pluginEl || createPluginEl();
    }

    return el || createPluginParentEl();
  }

  onRegistered(){


  }

  onRender(){


  }



}
