[![NPM version](https://img.shields.io/npm/v/spyne.svg?longCache=true&style=flat-square)](https://www.npmjs.com/package/spyne)
[![GitHub license](https://img.shields.io/github/license/spynejs/spyne.svg?longCache=true&style=flat-square)](https://github.com/spynejs/spyne/blob/master/LICENSE)



**Spyne is a full-featured, reactive framework designed to make frontend-applications 'easy to reason about'.**<br/>
A Spyne app is built around two components, *Channels* and *ViewStreams*:
* Channels publishes data and events
* ViewStreams renders DOM elements and append to one another to create smart view chains


## Getting Started ##
**View Documentation**<br/>
https://spynejs.org

#### Install ##
```
npm install spyne
```
**A Basic Spyne app**
```
import {SpyneApp, ViewStream} from 'spyne';
const spyne = new SpyneApp();

const app = new ViewStream({
   id: 'app'
});
app.appendToDom(document.body);
app.appendView(
    new ViewStream({tagName: 'h1', 'data': 'Hello World!'})
);

```

**Download or Fork Example App**<br/>
https://github.com/spynejs/spyne-example-app <br>


**Spyne and the DCI Pattern**<br/>
Spyne is based on the *Data Context Interaction* pattern, which in a nutshell is organized to adjust the Context (HTML tags) of a site by broadcasting Interactive (ViewStream) events and  by listening to Data (Channels).

