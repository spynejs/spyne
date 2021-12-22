import {SpyneApp, DomElement, SpyneAppProperties} from './spyne';
import {is, clone, pathSatisfies} from 'ramda';
export class SpynePlugin {

  constructor(props={}) {
    let {name, config, parentEl} = props;
    this.props = props;


    if (config===undefined){
      config = clone(props);
    }

    this.name = name || 'empty';
    this.props.name = name;
    config = SpynePlugin.mergeDefaultConfig(config, this.defaultConfig());
    this.props.parentEl = parentEl || SpynePlugin.createParentEl();
    SpynePlugin.getSpyneApp(name, config);

    if (this.props.traits!==undefined){
      this.addTraits(this.props.traits);
    }

    this.onBeforeRegistered();
    this.onRegistered();
    this.onRender();
  }

  static mergeDefaultConfig(config={}, defaultConfig=this.defaultConfig()){
    return Object.assign(defaultConfig, config);
  }

  static getSpyneApp(name, config){
    if(SpyneAppProperties.initialized===false){
      SpyneApp.init()
    }

    SpyneAppProperties.addPluginConfig(name, config);

  }

  static updateSpyneConfig(spyneApp, pluginName, pluginConfig){
    const pathExists = pathSatisfies(is(Object), ['config', 'plugins', pluginName])(spyneApp);

    if (pathExists===true){
      if (spyneApp.config.debug===true) {
        console.warn(`Spyne Warning: The plugin, ${pluginName}, already exists`)
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
        el.style.cssText="position:absolute; top:0;left:0;width:100%;height:100%;min-height:100vh;z-index:1000000; pointer-events:none";
        return el;
      }
      return pluginEl || createPluginEl();
    }

    return el || createPluginParentEl();
  }

  addTraits(traits){
    if (traits.constructor.name!=='Array'){
      traits = [traits];
    }
    const addTrait=(TraitClass)=>{
      return new TraitClass(this);
    };

    traits.forEach(addTrait);

  }

  onBeforeRegistered(){
    this.props.pluginName = this.props.name;
    this.props.config = SpyneAppProperties.getPluginConfigByPluginName(this.props.pluginName);
  }

  defaultConfig(){

    return {


    }

  }

  onRegistered(){


  }

  onRender(){


  }



}

