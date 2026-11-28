import { DomElement } from './views/dom-element.js'
import { SpyneAppProperties } from './utils/spyne-app-properties.js'
import { listenForPluginsToggle, pluginsAreDisabled, notePluginsDisabled } from './utils/spyne-plugins-toggle.js'
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
   *
   * A plugin is left unregistered while the plugins are turned off for the tab,
   * unless it does not allow disabling (allowsDisabling), which a plugin that does
   * real work for the app says. They are turned off, and on again, by the key
   * combination in the app's config, `pluginsToggleKeys`. That is so in a
   * development build, and in a production build only where the app's config has
   * `allowToggling: true`.
   *
   * @returns {Boolean} false where the plugin was not registered
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
      return false
    }

    if (this.allowsDisabling() === true) {
      // The keys are heard on the window channel, whether this plugin is let
      // through or not, so that the keys that turned the plugins off turn them on
      // again. Where they are not heard (the toggle is off in this app, as it is
      // in a production build unless the app says otherwise), a state left in the
      // tab is not acted on: there would be no way back.
      const listening = listenForPluginsToggle(_spyneAppProps)

      if (listening === true && pluginsAreDisabled() === true) {
        notePluginsDisabled(_spyneAppProps.config.pluginsToggleKeys)
        return false
      }
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
    return true
  }

  /**
   * Whether the plugins' toggle may leave this plugin unregistered. It is settled
   * in this order: `allowDisabling` as the app passed it in the plugin's config;
   * where that says nothing, `allowDisabling` as the plugin's own class gives it
   * in defaultConfig(); and where neither says anything, it may. Only `false`
   * keeps a plugin on.
   *
   * A class's defaults are merged under what the app passes, so the second step
   * matters for a key the app passed with no value: the merge lets that
   * overwrite the class's default, and this reads the default again.
   *
   * @returns {Boolean}
   */
  allowsDisabling() {
    const allowDisabling = this.props.config?.allowDisabling ?? this.defaultConfig()?.allowDisabling

    return allowDisabling !== false
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
    const requiredCustomEvents = this.props.requiredCustomEvents ?? []

    const windowConfig = SpyneAppProperties.getChannelConfig('WINDOW')

    const missingEvents = requiredEvents.filter(evt => !windowConfig.events.includes(evt))

    // entries on BOTH sides can be a name string or a {name, buffer|count|debounce|throttle}
    // object — hosts declare how the event is conformed, plugins declare the exact
    // configuration they expect, and matching is by name only
    const entryName = entry => typeof entry === 'string' ? entry : entry?.name
    const customEventNames = windowConfig.customEvents.map(entryName)
    const missingCustomEvents = requiredCustomEvents.filter(evt => !customEventNames.includes(entryName(evt)))

    // If any are missing, log a single warning listing them
    if (missingEvents.length > 0) {
      console.warn(
          `plugin "${this.props.name}" requires the following config.WINDOW.events, --> ${missingEvents.join(', ')} <--`
      )
    }

    if (missingCustomEvents.length > 0) {
      // print the exact configuration entry so it can be pasted into the host config
      const entryAsConfigStr = entry => typeof entry === 'string' ? `'${entry}'` : JSON.stringify(entry)
      console.warn(
        `plugin "${this.props.name}" requires the following config.WINDOW.customEvents, --> ${missingCustomEvents.map(entryAsConfigStr).join(', ')} <--`
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
