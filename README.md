## Spynejs - Modern and efficient javascript framework
#### Spyne's only dependencies are rxjs and ramda


There are only two dependencies, *rxjs* and *ramda*

## Live Examples ##
http://todos.spynejs.org <br>
http://example.spynejs.org

## Built With ##
http://landofsharks.com <br>
http://discoverlifeinspace.com 
## Example App ##
```
const spyne = new Spynejs(); // Initialize Spyne

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
Spynejs can be added using a script tag or as an npm package
```
npm install spynejs
```


## Why another framework ##
Spyne returns sanity to javascript single page application development.

ES6 was supposed to make developer lives easier and less complicated.

Instead, the recent explosion of libraries, compilers, transpilers and frameworks mash code and events into messy structures that become very difficult to reason with.

Main ideas:

* HTML tags are data (html is a subset of xml) and adding logic and code to data makes code harder to reason with
* Two way binding of events and data are convenient to build trivial applications, but they become unecessary hidden 'magic' that makes code very difficult to reason with.

Many frameworks complicate the easy parts of web development (creating dom elments and styles) while providing unjavascripty and inefficient structures to deal with the hard parts of web development (component messaging, asynchonous events, managing dom setup and breakdown).

Spyne's big takeaways:
* Automatic, 'but unmagical' rendering and disposing of dom chunks
* Stateless, using channels to maintain data
* One way channel messaging using rxjs, allowing for clean and efficient messaging
* Keeps css separate and cascading
* HTML templates contain only minor parsing logic
