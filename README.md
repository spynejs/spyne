# spyne

[![NPM version](https://img.shields.io/npm/v/spyne.svg?longCache=true&style=flat-square)](https://www.npmjs.com/package/spyne)
[![GitHub license](https://img.shields.io/github/license/spynejs/spyne.svg?longCache=true&style=flat-square)](https://github.com/spynejs/spyne/blob/master/LICENSE)
[![Build Status](https://app.travis-ci.com/spynejs/spyne.svg?token=tUNpKxHHHcwypyVzqWmD&branch=main)](https://travis-ci.com/spynejs/spyne)

SpyneJS is a full frontend framework for building modular, scalable web applications — structured for collaborative development between developers and AI assistants.

It uses real DOM rendering, observable behavior streams, and pure, reusable logic to create applications that are easy to read, reason about, and extend.

SpyneJS structures applications around the View–Behavior–Logic (VBL) architecture, giving developers and AI tools a clear roadmap for building, evolving, and maintaining software.

---

## Installation

```bash
npm install spyne
```

---

## Usage

```javascript
import { ViewStream } from 'spyne';

// Example: create a basic ViewStream
new ViewStream({
  data: 'Hello World'
}).appendToDom(document.body);
```

---

## Documentation

Full framework documentation is available at:  
[https://spynejs.com/docs](https://spynejs.com/docs)

Learn about:
- View–Behavior–Logic (VBL) architecture for clean separation of structure, behavior, and logic
- Modular hierarchical views (ViewStreams) for scalable UI composition
- Observable behavior streams (Channels) for reactive event/data flows
- Modular logic composition (SpyneTraits) for reusable, testable functions
- Application generation, metadata wiring, and AI-collaborative workflows

---

## License

SpyneJS is licensed under the **GNU Lesser General Public License v3.0 (LGPL-3.0)**  
© 2017–2025 Relevant Context, Inc.

You may freely use SpyneJS in commercial and open-source projects under the terms of the LGPL-3.0 license. See the [LICENSE](./LICENSE) file for full details.

**Note:** This license applies only to the core SpyneJS framework.  
All proprietary components — including the CMS, metadata proxy layer, AI Assistant UI, and the Plugin MCP Ecosystem — are the intellectual property of Relevant Context, Inc. and are available under a separate commercial license.

For licensing, partnerships, or enterprise integration inquiries, contact [frank@spynejs.com](mailto:frank@spynejs.com).


---
