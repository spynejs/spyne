### Spyne is a full-featured, reactive framework designed to make frontend-applications easy to reason about.


A Spyne app is built around two components, *Channels* and *ViewStreams*:
* Channels publishes data and events
* ViewStreams are components that append to one another to create smart view chains, and that reactively communicate with each other.


Spyne has two dependencies, *rxjs* and *ramda*; however, knowlege of rxjs or ramda is not required to begin using Spyne.

## Live Examples ##
http://todos.spynejs.org <br>


```
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


## Install ##
```
npm install spyne
```


## Spyne and the DCI Pattern ##
Spyne is based on the Data Context Interaction pattern, which in a nutshell is organized to adjust the Context (HTML tags) of a site by broadcasting Interactive (ViewStream) events and  by listening to Data (Channels).


