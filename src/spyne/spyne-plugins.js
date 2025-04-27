import { DomElement } from './views/dom-element.js'
import { SpyneAppProperties } from './utils/spyne-app-properties.js'
import { is, clone, pathSatisfies } from 'ramda'
let _spyneAppProps = SpyneAppProperties
export class SpynePlugin {
  constructor(props = {}) {
    let { name, config, parentEl } = props
    this.props = props

    if (config === undefined) {
      config = clone(props)
    }

    this.name = name || 'empty'
    this.props.name = name
    config = SpynePlugin.mergeDefaultConfig(config, this.defaultConfig())
    this.props.parentEl = parentEl || SpynePlugin.createParentEl()
    // SpynePlugin.getSpyneApp(name, config)
    this.props.config = config
    if (this.props.traits !== undefined) {
      this.addTraits(this.props.traits)
    }

    // this.onBeforeRegistered()
    // this.onRegistered()
    // this.onRender()
  }

  /**
   * Now this method will be called when the app decides to register the plugin.
   * This way, the plugin no longer has to import or rely on its own version
   * of SpyneAppProperties. Instead, it is *passed* the authoritative instance.
   */
  register(spyneAppProps) {
    // 1. Save a reference to the real SpyneAppProperties
    _spyneAppProps = spyneAppProps
    this.props.pluginName = this.props.name

    // this.props.config = _spyneAppProps.getPluginConfigByPluginName(this.props.pluginName)

    if (_spyneAppProps.initialized === false) {
      console.warn(
          `Spyne Warning: SpyneApp has not been initialized yet! Cannot register plugin "${this.name}".`
      )
      return
    }

    this.onBeforeRegistered()

    // 2. Add plugin config in the real SpyneAppProperties
    this.props.config = clone(this.props.config)
    _spyneAppProps.addPluginConfig(this.name, this.props.config)

    // If you have plugin-level logic that depends on the real spyneApp,
    // you can add it here, e.g.:
    // spyneAppProps.addPluginMethods(this.props.config.pluginMethods)

    // 3. If you have other plugin lifecycle methods
    this.onRegistered()
    this.onRender()
  }

  get SpyneAppProperties() {
    return _spyneAppProps
  }

  static mergeDefaultConfig(config = {}, defaultConfig = this.defaultConfig()) {
    return Object.assign(defaultConfig, config)
  }

  static getSpyneApp(name, config) {
    if (_spyneAppProps.initialized === false) {
      console.warn(`Spyne Warning: Unable to install plugin, ${name}! SpyneApp has not been initialized!`)
      // SpyneApp.init()
    } else {
      _spyneAppProps.addPluginConfig(name, config)
    }
  }

  static updateSpyneConfig(spyneApp, pluginName, pluginConfig) {
    const pathExists = pathSatisfies(is(Object), ['config', 'plugins', pluginName])(spyneApp)

    if (pathExists === true) {
      if (spyneApp.config.debug === true) {
        console.warn(`Spyne Warning: The plugin, ${pluginName}, already exists`)
      }
      return false
    }
    spyneApp.config.plugins[pluginName] = pluginConfig
    return spyneApp.config.plugins[pluginName]
  }

  static createParentEl(el) {
    const createPluginParentEl = () => {
      const pluginEl = document.getElementById('spyne-plugins')

      const createPluginEl = () => {
        const pluginEl = new DomElement({
          id: 'spyne-plugins'
        })
        document.body.appendChild(pluginEl.render())
        const el = document.getElementById('spyne-plugins')
        el.style.cssText = 'position:absolute; top:0;left:0;width:100%;height:100%;min-height:100vh;z-index:1000000; pointer-events:none'
        return el
      }
      return pluginEl || createPluginEl()
    }

    return el || createPluginParentEl()
  }

  addTraits(traits) {
    if (traits.constructor.name !== 'Array') {
      traits = [traits]
    }
    const addTrait = (TraitClass) => {
      return new TraitClass(this)
    }

    traits.forEach(addTrait)
  }

  onBeforeRegistered() {
    // this.props.pluginName = this.props.name
    // this.props.config = _spyneAppProps.getPluginConfigByPluginName(this.props.pluginName)
    this.checkForRequiredWindowEvent()
  }

  checkForRequiredWindowEvent() {
    const requiredEvents = this.props.requiredEvents ?? []
    const windowConfig = SpyneAppProperties.getChannelConfig('WINDOW')

    const missingEvents = requiredEvents.filter(evt => !windowConfig.events.includes(evt))

    // If any are missing, log a single warning listing them
    if (missingEvents.length > 0) {
      console.warn(
          `plugin "${this.props.name}" requires the following config.WINDOW.events, --> ${missingEvents.join(', ')} <--`
      )
    }
  }

  defaultConfig() {
    return {

    }
  }

  onRegistered() {

  }

  onRender() {

  }
}
