[![NPM version](https://img.shields.io/npm/v/spyne.svg?longCache=true&style=flat-square)](https://www.npmjs.com/package/spyne)
[![GitHub license](https://img.shields.io/github/license/spynejs/spyne.svg?longCache=true&style=flat-square)](https://github.com/spynejs/spyne/blob/master/LICENSE)
# Spyne.js
<em>Spyne is a full-featured, reactive framework that creates ‘easy to reason about’ code</em>

### Spyne.js’ key features includes:

* Real DOM architecture provides clarity and performance over Virtual DOM abstractions
* Chainable <b>ViewStreams</b> reactively maintains state
* Intuitive <b>Channel</b> data layer harnesses the power of RxJs
* Versatile process of extending components with pure, static functions
* Spyne debugger assists in 'wiring' Channels and ViewStreams
* Has two dependencies, [RxJs](https://rxjs-dev.firebaseapp.com) and [ramda](https://ramdajs.com)




## Getting Started ##
**View Documentation**<br/>
https://spynejs.org

#### Install ##
```
npm install spyne
```
**Hello World**<br>
[Edit in codepen](https://codepen.io/nybatista/pen/Pvvweb)
```
const spyneApp = new spyne.SpyneApp({debug:true});

// SENDS LATEST PAYLOAD TO ANY SUBSCRIBER
const channelHelloWorld = new spyne.Channel("CHANNEL_HELLO_WORLD", {sendCachedPayload:true});

// REGISTER ACTION(S) TO BE USED
channelHelloWorld.addRegisteredActions = ()=>["CHANNEL_HELLO_WORLD_DEFAULT_EVENT"];

// ADD TO LIST OF AVAILABLE CHANNELS
spyneApp.registerChannel(channelHelloWorld)

// SEND PAYLOAD
channelHelloWorld.sendChannelPayload("CHANNEL_HELLO_WORLD_DEFAULT_EVENT", {text:"HELLO WORLD!"});

class App extends spyne.ViewStream {
  constructor(props = {}) {
    props.tagName = 'h1';
    super(props);
  }
  addActionListeners() {
    return [
      ['CHANNEL_HELLO_WORLD_.*_EVENT', 'onHelloWorld'],
    ];
  }
  onHelloWorld(e){
     this.props.el.innerText = e.props().text;
  }
  onRendered() {
     this.addChannel("CHANNEL_HELLO_WORLD");
  }
 
}
 new App().appendToDom(document.body);
 
```
**Download or Fork Example App** (Tutorial to be added soon)<br/>
https://github.com/spynejs/spyne-example-app <br>

**Todos Example**<br/>
https://todos.spynejs.org</br>

### Feedback
Spyne was just released as an open source project in May, 2019, and any feedback would be greatly appreciated!<br>
To suggest a feature or report a bug: https://github.com/spynejs/spyne/issues

Created by [Frank Batista](https://frankbatista.com)
