[![NPM version](https://img.shields.io/npm/v/spyne.svg?longCache=true&style=flat-square)](https://www.npmjs.com/package/spyne)
[![GitHub license](https://img.shields.io/github/license/spynejs/spyne.svg?longCache=true&style=flat-square)](https://github.com/spynejs/spyne/blob/master/LICENSE)
# Spyne.js
<em>Spyne is a full-featured, reactive framework that creates ‘easy to reason about’ code</em>

### Spyne.js’ key features includes:

* Declarative style of coding with reactive and functional patterns
* Components are defined either as either a ViewStream object — the interactive-view layer, or as a Channel — the data layer.
* Events are first class citizens, and are streamed as data, in the form of Spyne Channels.
* ViewStreams and Channels communicate globally while remaining completely encapsulated.
* ViewStream instances exchange observables to creates smart DOM trees that reactively maintain state.
* Application Routing is based on a configurable map object.
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

// CREATE CHANNEL THAT SENDS LAST PAYLOAD TO ANY SUBSCRIBER
const channelHelloWorld = new spyne.Channel("CHANNEL_HELLO_WORLD", {sendCachedPayload:true});

// REGISTER ACTIONS TO BE USED
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


**Spyne and the DCI Pattern**<br/>
Spyne is based on the [*Data Context Interaction*](https://en.wikipedia.org/wiki/Data,_context_and_interaction) pattern, where ViewStreams renders the proper *Context* of the app by broadcasting *Interactive* events that affect the *Data*, which cycles back to ViewStreams resyncing the site to the expected *Context*.

### Feedback
Spyne was just released as an open source project in May, 2019, and any feedback would be greatly appreciated!<br>
To suggest a feature or report a bug: https://github.com/spynejs/spyne/issues

Created by [Frank Batista](https://frankbatista.com)
