[![NPM version](https://img.shields.io/npm/v/spyne.svg?longCache=true&style=flat-square)](https://www.npmjs.com/package/spyne)
[![GitHub license](https://img.shields.io/github/license/spynejs/spyne.svg?longCache=true&style=flat-square)](https://github.com/spynejs/spyne/blob/master/LICENSE)
# Spyne.js
<em>Spyne is a full-featured, reactive framework that creates ‘easy to reason about’ code</em>

### Spyne.js’ key features includes:

* Declarative style of coding with reactive and functional patterns, using [RxJs](https://rxjs-dev.firebaseapp.com) and [ramda](https://ramdajs.com)
* Components are defined either as either a ViewStream object — the interactive-view layer, or as a Channel — the data layer.
* Events are first class citizens, and are streamed as data, in the form of Spyne Channels.
* ViewStreams and Channels communicate globally while remaining completely encapsulated.
* ViewStream instances exchange observables when appending to one another, which creates smart DOM trees that reactively maintain state.
* Application Routing is based on a configurable map object.



## Getting Started ##
**View Documentation**<br/>
https://spynejs.org

#### Install ##
```
npm install spyne
```
**A Basic Spyne App**<br>
[Edit in jsfiddle](https://jsfiddle.net/nybatista/0ouqhn1y/)
```
import {SpyneApp, ViewStream} from 'spyne';
const spyne = new SpyneApp();

const app = new ViewStream({
   id: 'app'
});
app.appendToDom(document.body);
app.appendView(
    new ViewStream({tagName: 'h1', data: 'Hello World!'})
);

```
**Download or Fork Example App** (Tutorial to be added soon)<br/>
https://github.com/spynejs/spyne-example-app <br>

**Todos Example**<br/>
https://todos.spynejs.org</br>


**Spyne and the DCI Pattern**<br/>
Spyne is based on the [*Data Context Interaction*](https://en.wikipedia.org/wiki/Data,_context_and_interaction) pattern, where ViewStreams renders the proper *Context* of the app by broadcasting *Interactive* events that affect the *Data*, which cycles back to ViewStreams resyncing the site to the expected *Context*.

