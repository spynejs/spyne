import { Subject } from 'rxjs'
import { SpynePlugin } from '../../spyne/spyne-plugins'
import { SpyneApp } from '../../spyne/spyne-app'
import { SpyneAppProperties } from '../../spyne/utils/spyne-app-properties'
import {
  isDevelopmentBuild,
  parsePluginsToggleKeys,
  pluginsToggleKeysOf,
  matchesPluginsToggleKeys,
  pluginsAreDisabled,
  setPluginsDisabled,
  togglePlugins,
  listenForPluginsToggle,
  addPluginsToggleWindowEvents,
  isListeningForPluginsToggle,
  resetPluginsToggle
} from '../../spyne/utils/spyne-plugins-toggle'
const { expect } = require('chai')

const KEYS = 'ctrl+alt+p'
const KEYDOWN_ACTION = 'CHANNEL_WINDOW_KEYDOWN_EVENT'

const keydown = (init = {}) => new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
const theKeys = { code: 'KeyP', key: 'p', ctrlKey: true, altKey: true }

// What a plugin is handed when it is registered: the app's config, and a window
// channel that a test sends on. What the plugin told the app is kept.
// These tests are not a development build, so the toggle is off unless a config
// says allowToggling: true, as this one does unless a test gives its own appConfig
// ({} for an app that says nothing).
const createAppProps = ({ appConfig = { allowToggling: true }, pluginsToggleKeys = KEYS, windowEvents = ['click', 'keydown'], debug = false, initialized = true } = {}) => {
  const added = []
  const window$ = new Subject()
  const asked = []

  return {
    initialized,
    debug,
    config: { pluginsToggleKeys, ...appConfig, channels: { WINDOW: { events: windowEvents } } },
    channelsMap: {
      getStream: (name) => {
        asked.push(name)
        return { observer: window$ }
      }
    },
    addPluginConfig: (name, pluginConfig) => added.push([name, pluginConfig]),
    added,
    asked,
    window$,
    // the window channel sending a payload, as it does for an event the app lists
    send: (action, event) => window$.next({ channelName: 'CHANNEL_WINDOW', action, payload: event, srcElement: event.target, event })
  }
}

// A plugin that keeps the order its lifecycle ran in, and asks nothing of the app.
class PluginForTests extends SpynePlugin {
  constructor(props = {}) {
    super({ name: 'pluginForTests', ...props })
    this.ran = []
  }

  onBeforeRegistered() {
    this.ran.push('onBeforeRegistered')
  }

  onRegistered() {
    this.ran.push('onRegistered')
  }

  onRender() {
    this.ran.push('onRender')
  }
}

// A plugin whose class says it does real work for the app: not to be turned off,
// unless the app that makes it says otherwise.
class RealWorkPluginForTests extends PluginForTests {
  defaultConfig() {
    return { allowDisabling: false, position: 'top' }
  }
}

// A plugin whose class says in so many words that it can be turned off.
class DevToolPluginForTests extends PluginForTests {
  defaultConfig() {
    return { allowDisabling: true }
  }
}

describe('the plugins toggle', () => {
  let infos
  let warnings
  let consoleInfo
  let consoleWarn

  beforeEach(() => {
    resetPluginsToggle()
    setPluginsDisabled(false)
    infos = []
    warnings = []
    consoleInfo = console.info
    consoleWarn = console.warn
    console.info = (...args) => infos.push(args.join(' '))
    console.warn = (...args) => warnings.push(args.join(' '))
  })

  afterEach(() => {
    console.info = consoleInfo
    console.warn = consoleWarn
    resetPluginsToggle()
    setPluginsDisabled(false)
  })

  describe('the key combination', () => {
    it('reads a letter as its physical key, with its modifiers', () => {
      expect(parsePluginsToggleKeys('ctrl+alt+p')).to.deep.equal({ ctrlKey: true, altKey: true, shiftKey: false, metaKey: false, code: 'KeyP' })
    })

    it('reads whatever the case and the spacing', () => {
      expect(parsePluginsToggleKeys(' Ctrl + ALT + P ')).to.deep.equal(parsePluginsToggleKeys('ctrl+alt+p'))
    })

    it('reads a digit, a named key and the other names of the modifiers', () => {
      expect(parsePluginsToggleKeys('cmd+shift+8')).to.deep.equal({ ctrlKey: false, altKey: false, shiftKey: true, metaKey: true, code: 'Digit8' })
      expect(parsePluginsToggleKeys('control+option+F8').code).to.equal('F8')
      expect(parsePluginsToggleKeys('meta+Backquote').code).to.equal('Backquote')
    })

    it('does not read what is not a combination', () => {
      const notCombinations = [false, undefined, null, 42, '', 'p', 'shift+p', 'ctrl+alt', 'ctrl+alt+', 'ctrl+hyper+p', 'ctrl+alt+pp']

      notCombinations.forEach(value => expect(parsePluginsToggleKeys(value), String(value)).to.equal(undefined))
    })

    it('is matched by the physical key, not by the character it gives', () => {
      const keys = parsePluginsToggleKeys(KEYS)

      expect(matchesPluginsToggleKeys(keydown({ ...theKeys, key: 'π' }), keys)).to.equal(true)
      expect(matchesPluginsToggleKeys(keydown({ ...theKeys, code: 'KeyO', key: 'p' }), keys)).to.equal(false)
    })

    it('is not matched with a modifier more or a modifier less, or by a key held down', () => {
      const keys = parsePluginsToggleKeys(KEYS)

      expect(matchesPluginsToggleKeys(keydown({ ...theKeys, shiftKey: true }), keys)).to.equal(false)
      expect(matchesPluginsToggleKeys(keydown({ ...theKeys, metaKey: true }), keys)).to.equal(false)
      expect(matchesPluginsToggleKeys(keydown({ ...theKeys, altKey: false }), keys)).to.equal(false)
      expect(matchesPluginsToggleKeys(keydown({ ...theKeys, repeat: true }), keys)).to.equal(false)
      expect(matchesPluginsToggleKeys(keydown(theKeys), undefined)).to.equal(false)
      expect(matchesPluginsToggleKeys(undefined, keys)).to.equal(false)
    })
  })

  describe('whether the toggle is on in an app', () => {
    const development = true
    const production = false
    const on = parsePluginsToggleKeys(KEYS)

    it('is on in development and off in production, where the app says nothing', () => {
      expect(pluginsToggleKeysOf({ pluginsToggleKeys: KEYS }, development)).to.deep.equal(on)
      expect(pluginsToggleKeysOf({ pluginsToggleKeys: KEYS }, production)).to.equal(undefined)
      expect(pluginsToggleKeysOf({ allowToggling: undefined, pluginsToggleKeys: KEYS }, production)).to.equal(undefined)
    })

    it('is on in production where the app sets allowToggling: true', () => {
      expect(pluginsToggleKeysOf({ allowToggling: true, pluginsToggleKeys: KEYS }, production)).to.deep.equal(on)
    })

    it('is off in development where the app sets allowToggling: false', () => {
      expect(pluginsToggleKeysOf({ allowToggling: false, pluginsToggleKeys: KEYS }, development)).to.equal(undefined)
    })

    it('is turned on only by true itself, in production', () => {
      const notTrue = ['true', 1, 'yes', {}, null]

      notTrue.forEach(value => expect(pluginsToggleKeysOf({ allowToggling: value, pluginsToggleKeys: KEYS }, production), String(value)).to.equal(undefined))
    })

    it('is off wherever the keys are not a combination', () => {
      expect(pluginsToggleKeysOf({ allowToggling: true, pluginsToggleKeys: false }, development)).to.equal(undefined)
      expect(pluginsToggleKeysOf({ allowToggling: true }, development)).to.equal(undefined)
      expect(pluginsToggleKeysOf(undefined, development)).to.equal(undefined)
    })

    it('takes these tests for what they are: not a development build', () => {
      expect(isDevelopmentBuild()).to.equal(false)
      expect(pluginsToggleKeysOf({ pluginsToggleKeys: KEYS })).to.equal(undefined)
    })
  })

  describe('the state', () => {
    it('is on until it is turned off, and is kept for the tab', () => {
      expect(pluginsAreDisabled()).to.equal(false)
      expect(setPluginsDisabled(true)).to.equal(true)
      expect(pluginsAreDisabled()).to.equal(true)
      expect(window.sessionStorage.getItem('spynePluginsDisabled')).to.equal('1')
      setPluginsDisabled(false)
      expect(window.sessionStorage.getItem('spynePluginsDisabled')).to.equal(null)
    })

    it('a toggle turns it over and reloads the page, each time', () => {
      let reloads = 0
      const reload = () => { reloads += 1 }

      expect(togglePlugins(reload)).to.equal(true)
      expect(reloads).to.equal(1)
      expect(togglePlugins(reload)).to.equal(false)
      expect(reloads).to.equal(2)
    })
  })

  describe('the window events the toggle needs', () => {
    const development = true
    const production = false
    const configWith = (events, rest = {}) => ({ pluginsToggleKeys: KEYS, ...rest, channels: { WINDOW: { events } } })

    it('are added in development where the app does not list them', () => {
      const config = configWith(['click'])

      expect(addPluginsToggleWindowEvents(config, development)).to.deep.equal(['keydown'])
      expect(config.channels.WINDOW.events).to.deep.equal(['click', 'keydown'])
    })

    it('are not added in production', () => {
      const config = configWith(['click'])

      expect(addPluginsToggleWindowEvents(config, production)).to.deep.equal([])
      expect(config.channels.WINDOW.events).to.deep.equal(['click'])
    })

    it('are added in production where the app sets allowToggling: true', () => {
      const config = configWith(['click'], { allowToggling: true })

      expect(addPluginsToggleWindowEvents(config, production)).to.deep.equal(['keydown'])
      expect(config.channels.WINDOW.events).to.deep.equal(['click', 'keydown'])
    })

    it('are not added in development where the app sets allowToggling: false', () => {
      const config = configWith(['click'], { allowToggling: false })

      expect(addPluginsToggleWindowEvents(config, development)).to.deep.equal([])
      expect(config.channels.WINDOW.events).to.deep.equal(['click'])
    })

    it('are added to a new array: the one the app wrote is left as it was', () => {
      const appEvents = ['click']
      const config = configWith(appEvents)

      addPluginsToggleWindowEvents(config, development)
      expect(appEvents).to.deep.equal(['click'])
      expect(config.channels.WINDOW.events).to.not.equal(appEvents)
    })

    it('are not added twice where the app lists them', () => {
      const appEvents = ['click', 'keydown', 'keyup']
      const config = configWith(appEvents)

      expect(addPluginsToggleWindowEvents(config, development)).to.deep.equal([])
      expect(config.channels.WINDOW.events).to.equal(appEvents)
    })

    it('are not added where the keys are not a combination', () => {
      const notCombinations = [false, undefined, null, '', 'p', 'ctrl+alt']

      notCombinations.forEach((value) => {
        const config = configWith(['click'], { pluginsToggleKeys: value })

        expect(addPluginsToggleWindowEvents(config, development), String(value)).to.deep.equal([])
        expect(config.channels.WINDOW.events, String(value)).to.deep.equal(['click'])
      })
    })

    it('are added where the window channel has no list of events', () => {
      const config = configWith(undefined)

      expect(addPluginsToggleWindowEvents(config, development)).to.deep.equal(['keydown'])
      expect(config.channels.WINDOW.events).to.deep.equal(['keydown'])
    })

    it('ask nothing of a config with no window channel', () => {
      expect(addPluginsToggleWindowEvents({ pluginsToggleKeys: KEYS }, development)).to.deep.equal([])
      expect(addPluginsToggleWindowEvents(undefined, development)).to.deep.equal([])
    })

    it('are what a plugin then finds listened for', () => {
      const appProps = createAppProps({ windowEvents: ['click'] })

      addPluginsToggleWindowEvents(appProps.config)
      expect(listenForPluginsToggle(appProps, { onToggle: () => {} })).to.equal(true)
      expect(appProps.window$.observed).to.equal(true)
    })
  })

  describe('listening for the keys', () => {
    it('is by the window channel, and by nothing added to the page', () => {
      let toggles = 0
      const appProps = createAppProps()

      expect(listenForPluginsToggle(appProps, { onToggle: () => { toggles += 1 } })).to.equal(true)
      expect(appProps.asked).to.deep.equal(['CHANNEL_WINDOW'])

      // a key pressed in the page that the window channel does not send: not heard
      document.dispatchEvent(keydown(theKeys))
      window.dispatchEvent(keydown(theKeys))
      expect(toggles).to.equal(0)

      appProps.send(KEYDOWN_ACTION, keydown(theKeys))
      expect(toggles).to.equal(1)
    })

    it('toggles on the combination and on nothing else the channel sends', () => {
      let toggles = 0
      const appProps = createAppProps()

      listenForPluginsToggle(appProps, { onToggle: () => { toggles += 1 } })
      appProps.send(KEYDOWN_ACTION, keydown({ ...theKeys, altKey: false }))
      appProps.send(KEYDOWN_ACTION, keydown({ code: 'KeyP', key: 'p' }))
      appProps.send('CHANNEL_WINDOW_KEYUP_EVENT', keydown(theKeys))
      appProps.send('CHANNEL_WINDOW_CLICK_EVENT', new MouseEvent('click'))
      expect(toggles).to.equal(0)
      appProps.send(KEYDOWN_ACTION, keydown(theKeys))
      expect(toggles).to.equal(1)
    })

    it('subscribes once, however many plugins ask for it', () => {
      let toggles = 0
      const onToggle = () => { toggles += 1 }
      const appProps = createAppProps()

      expect(listenForPluginsToggle(appProps, { onToggle })).to.equal(true)
      expect(listenForPluginsToggle(appProps, { onToggle })).to.equal(true)
      expect(appProps.asked.length).to.equal(1)
      appProps.send(KEYDOWN_ACTION, keydown(theKeys))
      expect(toggles).to.equal(1)
    })

    it('does not subscribe in production, where the app says nothing', () => {
      let toggles = 0
      const appProps = createAppProps({ appConfig: {} })

      expect(listenForPluginsToggle(appProps, { onToggle: () => { toggles += 1 } })).to.equal(false)
      expect(isListeningForPluginsToggle()).to.equal(false)
      expect(appProps.asked).to.deep.equal([])
      expect(appProps.window$.observed).to.equal(false)
      appProps.send(KEYDOWN_ACTION, keydown(theKeys))
      expect(toggles).to.equal(0)
      expect(warnings).to.deep.equal([])
    })

    it('subscribes in development, where the app says nothing', () => {
      const appProps = createAppProps({ appConfig: {} })

      expect(listenForPluginsToggle(appProps, { onToggle: () => {}, isDevelopment: true })).to.equal(true)
      expect(appProps.window$.observed).to.equal(true)
    })

    it('does not subscribe where the app has turned the toggle off, in development either', () => {
      const byAllow = createAppProps({ appConfig: { allowToggling: false } })
      const byKeys = createAppProps({ pluginsToggleKeys: false })

      expect(listenForPluginsToggle(byAllow, { onToggle: () => {}, isDevelopment: true })).to.equal(false)
      expect(listenForPluginsToggle(byKeys, { onToggle: () => {}, isDevelopment: true })).to.equal(false)
      expect(byAllow.window$.observed).to.equal(false)
      expect(byKeys.window$.observed).to.equal(false)
      expect(warnings).to.deep.equal([])
    })

    it('does not subscribe where the window channel does not carry keydown, and says so once in debug mode', () => {
      const quiet = createAppProps({ windowEvents: ['click'] })
      const inDebug = createAppProps({ windowEvents: ['click'], debug: true })

      expect(listenForPluginsToggle(quiet)).to.equal(false)
      expect(quiet.window$.observed).to.equal(false)
      expect(warnings).to.deep.equal([])

      expect(listenForPluginsToggle(inDebug)).to.equal(false)
      expect(listenForPluginsToggle(inDebug)).to.equal(false)
      expect(inDebug.window$.observed).to.equal(false)
      expect(warnings.length).to.equal(1)
      expect(warnings[0]).to.include('keydown')
    })

    it('leaves the window channel when it is reset', () => {
      const appProps = createAppProps()

      listenForPluginsToggle(appProps, { onToggle: () => {} })
      expect(appProps.window$.observed).to.equal(true)
      resetPluginsToggle()
      expect(appProps.window$.observed).to.equal(false)
    })
  })

  describe('a plugin when it is registered', () => {
    const lifecycle = ['onBeforeRegistered', 'onRegistered', 'onRender']

    it('is registered as before where it says allowDisabling: false, on or off', () => {
      const plugin = new PluginForTests({ allowDisabling: false })
      const appProps = createAppProps()

      setPluginsDisabled(true)
      expect(plugin.register(appProps)).to.equal(true)
      expect(plugin.ran).to.deep.equal(lifecycle)
      expect(appProps.added.map(([name]) => name)).to.deep.equal(['pluginForTests'])
      expect(infos).to.deep.equal([])
    })

    it('does not have the window channel subscribed to where it says allowDisabling: false', () => {
      const appProps = createAppProps()

      new PluginForTests({ allowDisabling: false }).register(appProps)
      expect(isListeningForPluginsToggle()).to.equal(false)
      expect(appProps.window$.observed).to.equal(false)
    })

    it('can be turned off where it says nothing: it is left out while the plugins are off', () => {
      const plugin = new PluginForTests()
      const appProps = createAppProps()

      setPluginsDisabled(true)
      expect(plugin.register(appProps)).to.equal(false)
      expect(plugin.ran).to.deep.equal([])
      expect(appProps.added).to.deep.equal([])
      expect(appProps.window$.observed).to.equal(true)
      expect(infos.length).to.equal(1)
    })

    it('is kept on by false itself and by nothing else', () => {
      const notFalse = [undefined, null, 0, '', 'false', true]

      setPluginsDisabled(true)
      notFalse.forEach((value) => {
        const plugin = new PluginForTests({ allowDisabling: value })

        expect(plugin.register(createAppProps()), String(value)).to.equal(false)
      })
      expect(new PluginForTests({ allowDisabling: false }).register(createAppProps())).to.equal(true)
    })

    it('takes its default from its own class, where the app says nothing', () => {
      setPluginsDisabled(true)
      expect(new RealWorkPluginForTests().allowsDisabling()).to.equal(false)
      expect(new RealWorkPluginForTests().register(createAppProps())).to.equal(true)
      expect(new DevToolPluginForTests().allowsDisabling()).to.equal(true)
      expect(new DevToolPluginForTests().register(createAppProps())).to.equal(false)
    })

    it('takes its default from its own class where the app passes the key with no value', () => {
      const plugin = new RealWorkPluginForTests({ allowDisabling: undefined })

      // the merge of the class's defaults has let the app's undefined overwrite them
      expect(plugin.props.config.allowDisabling).to.equal(undefined)
      expect(plugin.props.config.position).to.equal('top')
      expect(plugin.allowsDisabling()).to.equal(false)

      setPluginsDisabled(true)
      expect(plugin.register(createAppProps())).to.equal(true)
      expect(plugin.ran.length).to.equal(3)
      expect(new RealWorkPluginForTests({ allowDisabling: null }).allowsDisabling()).to.equal(false)
    })

    it('is overruled by the app, either way', () => {
      setPluginsDisabled(true)
      // a plugin that does real work, which this app lets be turned off
      expect(new RealWorkPluginForTests({ allowDisabling: true }).register(createAppProps())).to.equal(false)
      // a dev tool, which this app keeps on
      expect(new DevToolPluginForTests({ allowDisabling: false }).register(createAppProps())).to.equal(true)
    })

    it('is overruled by the app where the config is passed as one', () => {
      setPluginsDisabled(true)
      expect(new RealWorkPluginForTests({ config: { allowDisabling: true } }).register(createAppProps())).to.equal(false)
      expect(new RealWorkPluginForTests({ config: {} }).register(createAppProps())).to.equal(true)
    })

    it('can be turned off where neither the app nor its class says anything', () => {
      class SaysNothingPluginForTests extends PluginForTests {
        defaultConfig() {
          return {}
        }
      }

      expect(new PluginForTests().allowsDisabling()).to.equal(true)
      expect(new SaysNothingPluginForTests({ config: {} }).allowsDisabling()).to.equal(true)
    })

    it('is registered where the plugins are on', () => {
      const plugin = new PluginForTests()
      const appProps = createAppProps()

      expect(plugin.register(appProps)).to.equal(true)
      expect(plugin.ran).to.deep.equal(lifecycle)
      expect(appProps.added.length).to.equal(1)
    })

    it('is left out while the plugins are off, with every other, and it is said once', () => {
      const first = new PluginForTests()
      const second = new PluginForTests({ name: 'secondPlugin' })
      const appProps = createAppProps()

      setPluginsDisabled(true)
      expect(first.register(appProps)).to.equal(false)
      expect(second.register(appProps)).to.equal(false)
      expect(first.ran).to.deep.equal([])
      expect(second.ran).to.deep.equal([])
      expect(appProps.added).to.deep.equal([])
      expect(infos.length).to.equal(1)
      expect(infos[0]).to.include(KEYS)
    })

    it('reads allowDisabling from a config that is passed as one', () => {
      const plugin = new PluginForTests({ config: { allowDisabling: false } })

      setPluginsDisabled(true)
      expect(plugin.register(createAppProps())).to.equal(true)
    })

    it('has the keys listened for whether it was let through or left out', () => {
      const letThrough = createAppProps()
      const leftOut = createAppProps()

      new PluginForTests().register(letThrough)
      expect(letThrough.window$.observed).to.equal(true)

      resetPluginsToggle()
      setPluginsDisabled(true)
      new PluginForTests().register(leftOut)
      expect(leftOut.window$.observed).to.equal(true)
    })

    it('is registered in production, though the tab says off, and nothing listens', () => {
      const plugin = new PluginForTests()
      const appProps = createAppProps({ appConfig: {} })

      setPluginsDisabled(true)
      expect(plugin.register(appProps)).to.equal(true)
      expect(plugin.ran).to.deep.equal(lifecycle)
      expect(appProps.window$.observed).to.equal(false)
      expect(infos).to.deep.equal([])
    })

    it('is registered, though the tab says off, where the app has turned the toggle off', () => {
      const byAllow = createAppProps({ appConfig: { allowToggling: false } })
      const byKeys = createAppProps({ pluginsToggleKeys: false })

      setPluginsDisabled(true)
      for (const appProps of [byAllow, byKeys]) {
        const plugin = new PluginForTests()

        expect(plugin.register(appProps)).to.equal(true)
        expect(plugin.ran).to.deep.equal(lifecycle)
        expect(appProps.window$.observed).to.equal(false)
      }
    })

    it('is registered, though the tab says off, where the window channel does not carry keydown', () => {
      const plugin = new PluginForTests()
      const appProps = createAppProps({ windowEvents: [] })

      setPluginsDisabled(true)
      expect(plugin.register(appProps)).to.equal(true)
      expect(plugin.ran).to.deep.equal(lifecycle)
      expect(appProps.window$.observed).to.equal(false)
    })

    it('is not registered, and answers false, where the app is not initialized', () => {
      const plugin = new PluginForTests()

      expect(plugin.register(createAppProps({ initialized: false }))).to.equal(false)
      expect(plugin.ran).to.deep.equal([])
      expect(warnings.length).to.equal(1)
    })
  })

  describe('SpyneAppProperties.registerPlugin', () => {
    // it warns when the app has not been initialized, as here; the warning is kept
    // out of the console by the suite's own console.warn

    it('answers what the plugin answered', () => {
      expect(SpyneAppProperties.registerPlugin({ register: () => true })).to.equal(true)
      expect(SpyneAppProperties.registerPlugin({ register: () => false })).to.equal(false)
    })

    it('counts a plugin whose register() answers nothing as registered', () => {
      expect(SpyneAppProperties.registerPlugin({ register: () => {} })).to.equal(true)
    })
  })

  // The app is initialized once for the page, so this is the last thing here: an
  // app whose config lists no keydown and turns the toggle on, as an app does to
  // test it in a build that is not a development one, which these tests are.
  describe('SpyneApp.init', () => {
    it('adds keydown to the window channel, which then carries it', () => {
      const appEvents = ['click']
      const heard = []

      SpyneApp.init({ allowToggling: true, channels: { WINDOW: { events: appEvents } } })
      expect(SpyneAppProperties.config.pluginsToggleKeys).to.equal(KEYS)
      expect(SpyneAppProperties.config.channels.WINDOW.events).to.deep.equal(['click', 'keydown'])
      expect(appEvents).to.deep.equal(['click'])

      const subscription = SpyneAppProperties.channelsMap.getStream('CHANNEL_WINDOW').observer
        .subscribe(channelPayload => heard.push(channelPayload.action))

      window.dispatchEvent(keydown({ code: 'KeyA', key: 'a' }))
      subscription.unsubscribe()
      expect(heard).to.deep.equal([KEYDOWN_ACTION])
    })

    it('lets a plugin that allows disabling hear the keys with nothing asked of the app', () => {
      let toggles = 0

      expect(listenForPluginsToggle(SpyneAppProperties, { onToggle: () => { toggles += 1 } })).to.equal(true)
      window.dispatchEvent(keydown(theKeys))
      expect(toggles).to.equal(1)
    })
  })
})
