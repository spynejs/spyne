### Spyne is a full-featured, reactive framework designed to make frontend-applications easy to reason about.


A Spyne app is built around two components, *Channels* and *ViewStreams*:
* Channels publishes data and events
* ViewStreams renders DOM elements and append to one another to create smart view chains, that corresponds to the DOM tree that they generate.


### Getting Started ###
#### View Documentation ####
https://spynejs.org

### Install ###
```
npm install spyne
```


#### A Basic Spyne app ####
```
import {SpyneApp, ViewStream} from 'spyne';
const spyne = new SpyneApp(); // Initialize Spyne

// Create the root view
const App = new ViewStream({
    el: document.querySelector('body')
});

// Append a text view
App.appendView(
    new ViewStream({tagName: 'h1', 'data': 'Hello World!'})
);

```

#### Download or Fork Example Spyne App ####
https://github.com/spynejs/spyne-example-app <br>





## Spyne and the DCI Pattern ##
Spyne is based on the Data Context Interaction pattern, which in a nutshell is organized to adjust the Context (HTML tags) of a site by broadcasting Interactive (ViewStream) events and  by listening to Data (Channels).


