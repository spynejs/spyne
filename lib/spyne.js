(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ramda"), require("rxjs"));
	else if(typeof define === 'function' && define.amd)
		define("spyne", ["ramda", "rxjs"], factory);
	else if(typeof exports === 'object')
		exports["spyne"] = factory(require("ramda"), require("rxjs"));
	else
		root["spyne"] = factory(root["R"], root["Rx"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_ramda__, __WEBPACK_EXTERNAL_MODULE_rxjs__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/spyne/spyne.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/data.validation/lib/index.js":
/*!***************************************************!*\
  !*** ./node_modules/data.validation/lib/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = __webpack_require__(/*! ./validation */ "./node_modules/data.validation/lib/validation.js")

/***/ }),

/***/ "./node_modules/data.validation/lib/validation.js":
/*!********************************************************!*\
  !*** ./node_modules/data.validation/lib/validation.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Copyright (c) 2013-2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * @module lib/validation
 */
module.exports = Validation

// -- Aliases ----------------------------------------------------------
var clone         = Object.create
var unimplemented = function(){ throw new Error('Not implemented.') }
var noop          = function(){ return this                         }


// -- Implementation ---------------------------------------------------

/**
 * The `Validation[α, β]` is a disjunction that's more appropriate for
 * validating inputs, or any use case where you want to aggregate failures. Not
 * only does the `Validation` provide a better terminology for working with
 * such cases (`Failure` and `Success` versus `Failure` and `Success`), it also
 * allows one to easily aggregate failures and successes as an Applicative
 * Functor.
 *
 * @class
 * @summary
 * Validation[α, β] <: Applicative[β]
 *                   , Functor[β]
 *                   , Show
 *                   , Eq
 */
function Validation() { }

Failure.prototype = clone(Validation.prototype)
function Failure(a) {
  this.value = a
}

Success.prototype = clone(Validation.prototype)
function Success(a) {
  this.value = a
}

// -- Constructors -----------------------------------------------------

/**
 * Constructs a new `Validation[α, β]` structure holding a `Failure` value.
 *
 * @summary a → Validation[α, β]
 */
Validation.Failure = function(a) {
  return new Failure(a)
}
Validation.prototype.Failure = Validation.Failure

/**
 * Constructs a new `Etiher[α, β]` structure holding a `Success` value.
 *
 * @summary β → Validation[α, β]
 */
Validation.Success = function(a) {
  return new Success(a)
}
Validation.prototype.Success = Validation.Success


// -- Conversions ------------------------------------------------------

/**
 * Constructs a new `Validation[α, β]` structure from a nullable type.
 *
 * Takes the `Failure` case if the value is `null` or `undefined`. Takes the
 * `Success` case otherwise.
 *
 * @summary α → Validation[α, α]
 */
Validation.fromNullable = function(a) {
  return a != null?       new Success(a)
  :      /* otherwise */  new Failure(a)
}
Validation.prototype.fromNullable = Validation.fromNullable

/**
 * Constructs a new `Either[α, β]` structure from a `Validation[α, β]` type.
 *
 * @summary Either[α, β] → Validation[α, β]
 */
Validation.fromEither = function(a) {
  return a.fold(Validation.Failure, Validation.Success)
}


// -- Predicates -------------------------------------------------------

/**
 * True if the `Validation[α, β]` contains a `Failure` value.
 *
 * @summary Boolean
 */
Validation.prototype.isFailure = false
Failure.prototype.isFailure    = true

/**
 * True if the `Validation[α, β]` contains a `Success` value.
 *
 * @summary Boolean
 */
Validation.prototype.isSuccess = false
Success.prototype.isSuccess    = true


// -- Applicative ------------------------------------------------------

/**
 * Creates a new `Validation[α, β]` instance holding the `Success` value `b`.
 *
 * `b` can be any value, including `null`, `undefined` or another
 * `Validation[α, β]` structure.
 *
 * @summary β → Validation[α, β]
 */
Validation.of = function(a) {
  return new Success(a)
}
Validation.prototype.of = Validation.of


/**
 * Applies the function inside the `Success` case of the `Validation[α, β]` structure
 * to another applicative type.
 *
 * The `Validation[α, β]` should contain a function value, otherwise a `TypeError`
 * is thrown.
 *
 * @method
 * @summary (@Validation[α, β → γ], f:Applicative[_]) => f[β] → f[γ]
 */
Validation.prototype.ap = unimplemented

Failure.prototype.ap = function(b) {
  return b.isFailure?     this.Failure(this.value.concat(b.value))
  :      /* otherwise */  this
}

Success.prototype.ap = function(b) {
  return b.isFailure?     b
  :      /* otherwise */  b.map(this.value)
}


// -- Functor ----------------------------------------------------------

/**
 * Transforms the `Success` value of the `Validation[α, β]` structure using a regular
 * unary function.
 *
 * @method
 * @summary (@Validation[α, β]) => (β → γ) → Validation[α, γ]
 */
Validation.prototype.map = unimplemented
Failure.prototype.map    = noop

Success.prototype.map = function(f) {
  return this.of(f(this.value))
}


// -- Show -------------------------------------------------------------

/**
 * Returns a textual representation of the `Validation[α, β]` structure.
 *
 * @method
 * @summary (@Validation[α, β]) => Void → String
 */
Validation.prototype.toString = unimplemented

Failure.prototype.toString = function() {
  return 'Validation.Failure(' + this.value + ')'
}

Success.prototype.toString = function() {
  return 'Validation.Success(' + this.value + ')'
}


// -- Eq ---------------------------------------------------------------

/**
 * Tests if an `Validation[α, β]` structure is equal to another `Validation[α, β]`
 * structure.
 *
 * @method
 * @summary (@Validation[α, β]) => Validation[α, β] → Boolean
 */
Validation.prototype.isEqual = unimplemented

Failure.prototype.isEqual = function(a) {
  return a.isFailure && (a.value === this.value)
}

Success.prototype.isEqual = function(a) {
  return a.isSuccess && (a.value === this.value)
}


// -- Extracting and recovering ----------------------------------------

/**
 * Extracts the `Success` value out of the `Validation[α, β]` structure, if it
 * exists. Otherwise throws a `TypeError`.
 *
 * @method
 * @summary (@Validation[α, β]) => Void → β         :: partial, throws
 * @see {@link module:lib/validation~Validation#getOrElse} — A getter that can handle failures.
 * @see {@link module:lib/validation~Validation#merge} — The convergence of both values.
 * @throws {TypeError} if the structure has no `Success` value.
 */
Validation.prototype.get = unimplemented

Failure.prototype.get = function() {
  throw new TypeError("Can't extract the value of a Failure(a).")
}

Success.prototype.get = function() {
  return this.value
}


/**
 * Extracts the `Success` value out of the `Validation[α, β]` structure. If the
 * structure doesn't have a `Success` value, returns the given default.
 *
 * @method
 * @summary (@Validation[α, β]) => β → β
 */
Validation.prototype.getOrElse = unimplemented

Failure.prototype.getOrElse = function(a) {
  return a
}

Success.prototype.getOrElse = function(_) {
  return this.value
}


/**
 * Transforms a `Failure` value into a new `Validation[α, β]` structure. Does nothing
 * if the structure contain a `Success` value.
 *
 * @method
 * @summary (@Validation[α, β]) => (α → Validation[γ, β]) → Validation[γ, β]
 */
Validation.prototype.orElse = unimplemented
Success.prototype.orElse    = noop

Failure.prototype.orElse = function(f) {
  return f(this.value)
}


/**
 * Returns the value of whichever side of the disjunction that is present.
 *
 * @summary (@Validation[α, α]) => Void → α
 */
Validation.prototype.merge = function() {
  return this.value
}


// -- Folds and Extended Transformations -------------------------------

/**
 * Applies a function to each case in this data structure.
 *
 * @method
 * @summary (@Validation[α, β]) => (α → γ), (β → γ) → γ
 */
Validation.prototype.fold = unimplemented

Failure.prototype.fold = function(f, _) {
  return f(this.value)
}

Success.prototype.fold = function(_, g) {
  return g(this.value)
}

/**
 * Catamorphism.
 * 
 * @method
 * @summary (@Validation[α, β]) => { Success: α → γ, Failure: α → γ } → γ
 */
Validation.prototype.cata = unimplemented

Failure.prototype.cata = function(pattern) {
  return pattern.Failure(this.value)
}

Success.prototype.cata = function(pattern) {
  return pattern.Success(this.value)
}


/**
 * Swaps the disjunction values.
 *
 * @method
 * @summary (@Validation[α, β]) => Void → Validation[β, α]
 */
Validation.prototype.swap = unimplemented

Failure.prototype.swap = function() {
  return this.Success(this.value)
}

Success.prototype.swap = function() {
  return this.Failure(this.value)
}


/**
 * Maps both sides of the disjunction.
 *
 * @method
 * @summary (@Validation[α, β]) => (α → γ), (β → δ) → Validation[γ, δ]
 */
Validation.prototype.bimap = unimplemented

Failure.prototype.bimap = function(f, _) {
  return this.Failure(f(this.value))
}

Success.prototype.bimap = function(_, g) {
  return this.Success(g(this.value))
}


/**
 * Maps the failure side of the disjunction.
 *
 * @method
 * @summary (@Validation[α, β]) => (α → γ) → Validation[γ, β]
 */
Validation.prototype.failureMap = unimplemented
Success.prototype.failureMap    = noop

Failure.prototype.failureMap = function(f) {
  return this.Failure(f(this.value))
}

/**
 * Maps the failure side of the disjunction.
 *
 * @method
 * @deprecated in favour of {@link module:lib/validation~Validation#failureMap}
 * @summary (@Validation[α, β]) => (α → γ) → Validation[γ, β]
 */
Validation.prototype.leftMap = Validation.prototype.failureMap
Success.prototype.leftMap    = Success.prototype.failureMap
Failure.prototype.leftMap    = Failure.prototype.failureMap


/***/ }),

/***/ "./node_modules/whatwg-fetch/fetch.js":
/*!********************************************!*\
  !*** ./node_modules/whatwg-fetch/fetch.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);


/***/ }),

/***/ "./src/spyne/channels/channel-route.js":
/*!*********************************************!*\
  !*** ./src/spyne/channels/channel-route.js ***!
  \*********************************************/
/*! exports provided: ChannelRoute */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChannelRoute", function() { return ChannelRoute; });
/* harmony import */ var _channels_channels_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../channels/channels-base */ "./src/spyne/channels/channels-base.js");
/* harmony import */ var _utils_channel_util_urls__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/channel-util-urls */ "./src/spyne/utils/channel-util-urls.js");
/* harmony import */ var _utils_channel_util_route__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/channel-util-route */ "./src/spyne/utils/channel-util-route.js");




var Rx = __webpack_require__(/*! rxjs */ "rxjs");

var R = __webpack_require__(/*! ramda */ "ramda");

class ChannelRoute extends _channels_channels_base__WEBPACK_IMPORTED_MODULE_0__["ChannelsBase"] {
  constructor() {
    var _this;

    _this = super();
    this.createChannelActionsObj();
    this.props.name = 'ROUTE';
    this.routeConfigJson = this.getRouteConfig();
    this.bindStaticMethods();
    this.navToStream$ = new Rx.BehaviorSubject();
    this.observer$ = this.navToStream$.map(function (info) {
      return _this.onMapNext(info);
    });
  }

  initializeStream() {
    this.initStream();
  }

  createChannelActionsObj() {
    var arr = this.addRegisteredActions();

    var converter = function converter(str) {
      return R.objOf(str, str);
    };

    var obj = R.mergeAll(R.chain(converter, arr));
    this.channelActions = obj;
  }

  addRegisteredActions() {
    return ['CHANNEL_ROUTE_DEEPLINK_EVENT', 'CHANNEL_ROUTE_CHANGE_EVENT'];
  }

  getRouteConfig() {
    var spyneConfig = window.Spyne.config;
    var routeConfig = R.path(['channels', 'ROUTE'], spyneConfig);

    if (routeConfig.type === 'query') {
      routeConfig.isHash = false;
    }

    var arr = _utils_channel_util_route__WEBPACK_IMPORTED_MODULE_2__["RouteUtils"].flattenConfigObject(routeConfig.routes);
    routeConfig['paramsArr'] = arr;
    return routeConfig;
  }

  initStream() {
    this.firstLoadStream$ = new Rx.BehaviorSubject(this.onIncomingDomEvent(undefined, this.routeConfigJson, '' + 'CHANNEL_ROUTE_DEEPLINK_EVENT'));
    _utils_channel_util_route__WEBPACK_IMPORTED_MODULE_2__["RouteUtils"].createPopStateStream(this.onIncomingDomEvent.bind(this));
    this.observer$ = Rx.Observable.merge(this.firstLoadStream$, this.navToStream$);
  }

  onMapNext(data, firstLoaded) {
    if (firstLoaded === void 0) {
      firstLoaded = false;
    }

    data['action'] = 'CHANNEL_ROUTE_CHANGE_EVENT';
    return data;
  }

  static onIncomingDomEvent(evt, config, actn) {
    if (config === void 0) {
      config = this.routeConfigJson;
    }

    var action = actn !== undefined ? actn : this.channelActions.CHANNEL_ROUTE_CHANGE_EVENT;
    var payload = this.getDataFromString(config); // console.log('route dom ',action, payload);

    this.sendStreamItem(action, payload, undefined, undefined, this.navToStream$);
  }

  onIncomingObserverableData(pl) {
    var action = this.channelActions.CHANNEL_ROUTE_CHANGE_EVENT;
    var payload = this.getDataFromParams(pl);
    var srcElement = R.path(['observableData', 'srcElement'], pl);
    var uiEvent = pl.observableEvent;
    var changeLocationBool = !payload.isHidden;
    this.sendRouteStream(payload, changeLocationBool);
    this.sendStreamItem(action, payload, srcElement, uiEvent, this.navToStream$);
  }

  sendRouteStream(payload, changeWindowLoc) {
    if (changeWindowLoc === void 0) {
      changeWindowLoc = true;
    }

    if (changeWindowLoc === true) {
      this.setWindowLocation(payload);
    }
  }

  static getRouteState(str) {
    return 'CHANNEL_ROUTE_CHANGE_EVENT';
  }

  static getIsDeepLinkBool() {
    return this._routeCount === 0;
  }

  static getRouteCount() {
    if (this._routeCount === undefined) {
      this._routeCount = 0;
      return this._routeCount;
    }

    this._routeCount += 1;
    return this._routeCount;
  }

  static getExtraPayloadParams(config) {
    if (config === void 0) {
      config = this.routeConfigJson;
    }

    var routeCount = this.getRouteCount();
    var isDeepLink = this.getIsDeepLinkBool();
    var isHash = config.isHash;
    var isHidden = config.isHidden;
    var routeType = config.type;
    return {
      routeCount: routeCount,
      isDeepLink: isDeepLink,
      isHash: isHash,
      isHidden: isHidden,
      routeType: routeType
    };
  }

  static getDataFromParams(pl, config) {
    if (config === void 0) {
      config = this.routeConfigJson;
    }

    var keywords = R.path(['observableData', 'payload'], pl);
    var routeValue = this.getRouteStrFromParams(keywords, config);
    var dataFromStr = this.getDataFromLocationStr();
    var routeKeyword = dataFromStr.routeKeyword,
        routeKeywordsArr = dataFromStr.routeKeywordsArr;
    keywords = R.merge(dataFromStr.keywords, keywords);

    var _getExtraPayloadParam = this.getExtraPayloadParams(config),
        routeCount = _getExtraPayloadParam.routeCount,
        isDeepLink = _getExtraPayloadParam.isDeepLink,
        isHash = _getExtraPayloadParam.isHash,
        isHidden = _getExtraPayloadParam.isHidden,
        routeType = _getExtraPayloadParam.routeType;

    return {
      isDeepLink: isDeepLink,
      routeCount: routeCount,
      routeKeyword: routeKeyword,
      routeKeywordsArr: routeKeywordsArr,
      keywords: keywords,
      routeValue: routeValue,
      isHash: isHash,
      isHidden: isHidden,
      routeType: routeType
    };
  }

  static getDataFromString(config, actn) {
    if (config === void 0) {
      config = this.routeConfigJson;
    }

    var type = config.type;
    var hashIsTrue = config.isHash === true; //type = config.isHash === true ? ''

    var str = _utils_channel_util_urls__WEBPACK_IMPORTED_MODULE_1__["URLUtils"].getLocationStrByType(type, hashIsTrue);

    var _ChannelRoute$getPara = ChannelRoute.getParamsFromRouteStr(str, config, type),
        routeKeywordsArr = _ChannelRoute$getPara.routeKeywordsArr,
        routeKeyword = _ChannelRoute$getPara.routeKeyword,
        keywords = _ChannelRoute$getPara.keywords,
        routeValue = _ChannelRoute$getPara.routeValue;

    var _getExtraPayloadParam2 = this.getExtraPayloadParams(config),
        routeCount = _getExtraPayloadParam2.routeCount,
        isDeepLink = _getExtraPayloadParam2.isDeepLink,
        isHash = _getExtraPayloadParam2.isHash,
        routeType = _getExtraPayloadParam2.routeType,
        isHidden = _getExtraPayloadParam2.isHidden;

    var obj = {
      isDeepLink: isDeepLink,
      routeCount: routeCount,
      routeKeyword: routeKeyword,
      routeKeywordsArr: routeKeywordsArr,
      keywords: keywords,
      routeValue: routeValue,
      isHash: isHash,
      isHidden: isHidden,
      routeType: routeType
    };
    return obj;
  }

  static getDataFromLocationStr(t) {
    if (t === void 0) {
      t = 'slash';
    }

    var type = this.routeConfigJson !== undefined ? this.routeConfigJson.type : t;
    var str = _utils_channel_util_urls__WEBPACK_IMPORTED_MODULE_1__["URLUtils"].getLocationStrByType(type);

    var _getParamsFromRouteSt = this.getParamsFromRouteStr(str, this.routeConfigJson, type),
        routeKeywordsArr = _getParamsFromRouteSt.routeKeywordsArr,
        routeKeyword = _getParamsFromRouteSt.routeKeyword,
        keywords = _getParamsFromRouteSt.keywords,
        routeValue = _getParamsFromRouteSt.routeValue;

    var action = this.getRouteState();
    return {
      routeKeywordsArr: routeKeywordsArr,
      routeKeyword: routeKeyword,
      keywords: keywords,
      routeValue: routeValue,
      action: action
    };
  }

  static getLocationData() {
    var locationParamsArr = ['href', 'origin', 'protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash'];
    return R.pickAll(locationParamsArr, window.location);
  }

  static getRouteStrFromParams(paramsData, routeConfig, t) {
    var type = t !== undefined ? t : routeConfig.type;
    return _utils_channel_util_urls__WEBPACK_IMPORTED_MODULE_1__["URLUtils"].convertParamsToRoute(paramsData, routeConfig, type);
  }

  static getParamsFromRouteStr(str, routeConfig, t) {
    var type = t !== undefined ? t : routeConfig.type;
    return _utils_channel_util_urls__WEBPACK_IMPORTED_MODULE_1__["URLUtils"].convertRouteToParams(str, routeConfig, type);
  }

  checkEmptyRouteStr(str, isHash) {
    if (isHash === void 0) {
      isHash = false;
    }

    var isEmpty = R.isEmpty(str);
    var pathNameIsEmptyBool = isEmpty === true && isHash === false;
    var hashNameIsEmptyBool = isEmpty === true && isHash === true;
    var hashNameBool = isEmpty === false && isHash === true;
    console.log('ROUTE STR CHECK ', {
      str: str,
      isHash: isHash
    });

    if (pathNameIsEmptyBool === true || hashNameIsEmptyBool === true) {
      return '/';
    } else if (hashNameBool === true) {
      return R.concat('#', str);
    }

    return str;
  }

  setWindowLocation(channelPayload) {
    var isHash = channelPayload.isHash,
        routeValue = channelPayload.routeValue;
    routeValue = this.checkEmptyRouteStr(routeValue, isHash);

    if (isHash === true) {
      // window.location.hash = routeValue;
      console.log('ROUTE STR FOR HASH ', routeValue);
      window.history.pushState({}, '', routeValue);
    } else {
      // routeValue =  R.when(R.isEmpty, R.always('/'))(routeValue);
      var checkForSlash = R.when(R.compose(R.complement(R.equals('/')), R.head), R.concat('/', R.__));
      window.history.pushState({}, '', checkForSlash(routeValue));
    }
  }

  getWindowLocation() {
    return window.location.pathname; // pullHashAndSlashFromPath(window.location.hash);
  }

  bindStaticMethods() {
    this.getIsDeepLinkBool = ChannelRoute.getIsDeepLinkBool.bind(this);
    this.getDataFromLocationStr = ChannelRoute.getDataFromLocationStr.bind(this);
    this.onIncomingDomEvent = ChannelRoute.onIncomingDomEvent.bind(this);
    this.getDataFromString = ChannelRoute.getDataFromString.bind(this);
    this.getParamsFromRouteStr = ChannelRoute.getParamsFromRouteStr.bind(this);
    this.getLocationData = ChannelRoute.getLocationData.bind(this);
    this.getRouteState = ChannelRoute.getRouteState.bind(this);
    this.getDataFromParams = ChannelRoute.getDataFromParams.bind(this);
    this.getRouteCount = ChannelRoute.getRouteCount.bind(this);
    this.getExtraPayloadParams = ChannelRoute.getExtraPayloadParams.bind(this);
    var curriedGetRoute = R.curryN(3, ChannelRoute.getRouteStrFromParams);
    this.getRouteStrFromParams = curriedGetRoute(R.__, this.routeConfigJson, this.routeConfigJson.type);
  }

}

/***/ }),

/***/ "./src/spyne/channels/channel-stream-item.js":
/*!***************************************************!*\
  !*** ./src/spyne/channels/channel-stream-item.js ***!
  \***************************************************/
/*! exports provided: ChannelStreamItem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChannelStreamItem", function() { return ChannelStreamItem; });
var R = __webpack_require__(/*! ramda */ "ramda");

class ChannelStreamItem {
  constructor(channelName, action, channelPayload, srcElement, event) {
    var channel = channelName;
    var channelStreamItemObj = {
      channel: channel,
      action: action,
      channelPayload: channelPayload,
      srcElement: srcElement,
      event: event
    };
    var channelActionsArr = window.Spyne.getChannelActions(channel);
    ChannelStreamItem.validateAction(action, channel, channelActionsArr);

    if (channel === 'ROUTE') {
      channelStreamItemObj['location'] = ChannelStreamItem.getLocationData();
    }

    return channelStreamItemObj;
  }

  static validateAction(action, channel, arr) {
    var isInArr = R.contains(action, arr);

    if (isInArr === false && window.Spyne !== undefined) {
      console.warn("warning: Action: '" + action + "' is not registered within the " + channel + " channel!");
    }

    return isInArr;
  }

  static getLocationData() {
    var locationParamsArr = ['href', 'origin', 'protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash'];
    return R.pickAll(locationParamsArr, window.location);
  }

  static getStreamItem() {}

  static getMouseEventKeys() {
    return ['altKey', 'bubbles', 'cancelBubble', 'cancelable', 'clientX', 'clientY', 'composed', 'ctrlKey', 'currentTarget', 'defaultPrevented', 'detail', 'eventPhase', 'fromElement', 'isTrusted', 'layerX', 'layerY', 'metaKey', 'movementX', 'movementY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'path', 'relatedTarget', 'returnValue', 'screenX', 'screenY', 'shiftKey', 'sourceCapabilities', 'srcElement', 'target', 'timeStamp', 'toElement', 'type', 'view', 'which', 'x', 'y'];
  }

}

/***/ }),

/***/ "./src/spyne/channels/channel-ui.js":
/*!******************************************!*\
  !*** ./src/spyne/channels/channel-ui.js ***!
  \******************************************/
/*! exports provided: ChannelUI */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChannelUI", function() { return ChannelUI; });
/* harmony import */ var _channels_channels_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../channels/channels-base */ "./src/spyne/channels/channels-base.js");


var R = __webpack_require__(/*! ramda */ "ramda");

var Rx = __webpack_require__(/*! rxjs */ "rxjs");

class ChannelUI extends _channels_channels_base__WEBPACK_IMPORTED_MODULE_0__["ChannelsBase"] {
  constructor() {
    super();
    this.props.name = 'UI';
    this.keyEventsLoaded = false;
    this.keyCodeArr = []; // this.addKeyEvent(13);
  }

  addRegisteredActions() {
    return ['CHANNEL_UI_EVENT', 'CHANNEL_UI_BLUR_EVENT', 'CHANNEL_UI_CLICK_EVENT', 'CHANNEL_UI_CHANGE_EVENT', 'CHANNEL_UI_CHANGE_EVENT', 'CHANNEL_UI_DBLCLICK_EVENT', 'CHANNEL_UI_FOCUS_EVENT', 'CHANNEL_UI_FOCUSIN_EVENT', 'CHANNEL_UI_FOCUSOUT_EVENT', 'CHANNEL_UI_INPUT_EVENT', 'CHANNEL_UI_KEYDOWN_EVENT', 'CHANNEL_UI_KEYPRESS_EVENT', 'CHANNEL_UI_KEYUP_EVENT', 'CHANNEL_UI_MOUSEDOWN_EVENT', 'CHANNEL_UI_MOUSEENTER_EVENT', 'CHANNEL_UI_MOUSELEAVE_EVENT', 'CHANNEL_UI_MOUSEMOVE_EVENT', 'CHANNEL_UI_MOUSEOUT_EVENT', 'CHANNEL_UI_MOUSEOVER_EVENT', 'CHANNEL_UI_MOUSEUP_EVENT', 'CHANNEL_UI_SELECT_EVENT'];
  }

  loadKeyStream() {
    var _this = this;

    var keyUps = Rx.Observable.fromEvent(document, 'keyup');

    var filterKeys = function filterKeys(e) {
      return _this.keyCodeArr.indexOf(e.keyCode) >= 0;
    };

    this.keyPresses$ = keyUps.groupBy(function (e) {
      return e.keyCode;
    }).mergeAll().filter(filterKeys).repeat().subscribe(this.onKeyPressed.bind(this));
  }

  addKeyEvent(num) {
    if (this.keyEventsLoaded === false) {
      this.loadKeyStream();
    }

    this.keyEventsLoaded = true;
    this.registerKey(num);
  }

  registerKey(c) {
    this.keyCodeArr.push(c);
  }

  onKeyPressed(evt) {
    console.log('key is ', evt);
  }

  onIncomingObservable(obj) {
    var _this2 = this;

    var eqsName = R.equals(obj.name, this.props.name);

    var dataObj = function dataObj(obsVal) {
      return {
        observableData: obj.data,
        uiEvent: obsVal
      };
    };

    var onSuccess = function onSuccess(obj) {
      return obj.observable.map(dataObj).subscribe(_this2.onUIEvent.bind(_this2));
    };

    var onError = function onError() {};

    return eqsName === true ? onSuccess(obj) : onError();
  }

  getActionState(val) {
    var typeVal = R.path(['uiEvent', 'type']);
    var typeOverRideVal = R.path(['uiEvent', 'typeOverRide']);
    var eventType = R.compose(R.toUpper, R.either(typeOverRideVal, typeVal));
    var type = eventType(val);
    var mainAction = 'CHANNEL_UI';
    return type !== undefined ? mainAction + "_" + type + "_EVENT" : mainAction;
  }

  onUIEvent(obs) {
    obs['action'] = this.getActionState(obs);
    var action = obs.action; // this.getActionState(obs);

    var _obs$observableData = obs.observableData,
        payload = _obs$observableData.payload,
        srcElement = _obs$observableData.srcElement;
    var event = obs.uiEvent;
    this.sendStreamItem(action, payload, srcElement, event);
  }

}

/***/ }),

/***/ "./src/spyne/channels/channel-window.js":
/*!**********************************************!*\
  !*** ./src/spyne/channels/channel-window.js ***!
  \**********************************************/
/*! exports provided: ChannelWindow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChannelWindow", function() { return ChannelWindow; });
/* harmony import */ var _channels_channels_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../channels/channels-base */ "./src/spyne/channels/channels-base.js");
/* harmony import */ var _utils_frp_tools__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/frp-tools */ "./src/spyne/utils/frp-tools.js");
/* harmony import */ var _utils_channel_util_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/channel-util-dom */ "./src/spyne/utils/channel-util-dom.js");




var R = __webpack_require__(/*! ramda */ "ramda");

var Rx = __webpack_require__(/*! rxjs */ "rxjs");

class ChannelWindow extends _channels_channels_base__WEBPACK_IMPORTED_MODULE_0__["ChannelsBase"] {
  constructor() {
    super();
    this.bindStaticMethods();
    this.observer$ = new Rx.Subject();
    this.props.name = 'WINDOW';
  }

  initializeStream() {
    var _Rx$Observable,
        _this = this;

    this.domChannelConfig = window.Spyne.config.channels.WINDOW;
    this.currentScrollY = window.scrollY;
    var obs$Arr = this.getActiveObservables();

    var dom$ = (_Rx$Observable = Rx.Observable).merge.apply(_Rx$Observable, obs$Arr);

    dom$.subscribe(function (p) {
      var action = p.action,
          channelPayload = p.channelPayload,
          srcElement = p.srcElement,
          event = p.event;

      _this.sendStreamItem(action, channelPayload, srcElement, event);
    });
  }

  static getScrollMapFn(event) {
    var action = this.channelActions.CHANNEL_WINDOW_SCROLL_EVENT;
    var scrollY = window.scrollY;
    var scrollDistance = this.currentScrollY - scrollY;
    var scrollDir = scrollDistance >= 0 ? 'up' : 'down';
    this.currentScrollY = scrollY;
    var channelPayload = {
      scrollY: scrollY,
      scrollDistance: scrollDistance,
      scrollDir: scrollDir
    };
    var srcElement = event.srcElement;
    return {
      action: action,
      channelPayload: channelPayload,
      srcElement: srcElement,
      scrollDistance: scrollDistance,
      event: event
    };
  }

  static getMouseWheelMapFn(event) {
    var action = this.channelActions.CHANNEL_WINDOW_MOUSEWHEEL_EVENT;
    var scrollDir = event.deltaY <= 0 ? 'up' : 'down';
    var deltaX = event.deltaX,
        deltaY = event.deltaY,
        deltaZ = event.deltaZ;
    var channelPayload = {
      scrollDir: scrollDir,
      deltaX: deltaX,
      deltaY: deltaY,
      deltaZ: deltaZ
    };
    var srcElement = event.srcElement;
    return {
      action: action,
      channelPayload: channelPayload,
      srcElement: srcElement,
      event: event
    };
  }

  static createCurriedGenericEvent(actionStr) {
    var action = "CHANNEL_WINDOW_" + actionStr.toUpperCase() + "_EVENT";
    var curryFn = R.curry(ChannelWindow.mapGenericEvent);
    return curryFn(action);
  }

  static mapGenericEvent(actn, event) {
    console.log("map generic event ", actn);
    var action = actn;
    var channelPayload = event;
    var srcElement = event.srcElement;
    return {
      action: action,
      channelPayload: channelPayload,
      srcElement: srcElement,
      event: event
    };
  }

  static getResizeMapFn(event) {
    var action = this.channelActions.CHANNEL_WINDOW_RESIZE_EVENT;
    var channelPayload = R.pick(['innerWidth', 'innerHeight', 'outerWidth', 'outerHeight'], window);
    var srcElement = event.srcElement;
    return {
      action: action,
      channelPayload: channelPayload,
      srcElement: srcElement,
      event: event
    };
  }

  static getOrientationMapFn(event) {
    var action = this.channelActions.CHANNEL_WINDOW_ORIENTATION_EVENT;
    var orientationStr = '(orientation: portrait)';
    var isPortraitBool = window.matchMedia(orientationStr).matches;
    var channelPayload = R.pick(['innerWidth', 'innerHeight', 'outerWidth', 'outerHeight'], window);
    channelPayload['orientation'] = isPortraitBool === true ? 'portrait' : 'landscape';
    var srcElement = event.srcElement;
    return {
      action: action,
      channelPayload: channelPayload,
      srcElement: srcElement,
      event: event
    };
  }

  getMediaQueryMapFn(event) {
    var action = this.channelActions.CHANNEL_WINDOW_MEDIA_QUERY_EVENT;
    var channelPayload = R.pick(['matches', 'media', 'mediaQueryName'], event);
    var srcElement = event.srcElement;
    return {
      action: action,
      channelPayload: channelPayload,
      srcElement: srcElement,
      event: event
    };
  }

  createMouseWheelObservable(config) {
    var debounceTime = config.debounceMSTimeForScroll;
    return _utils_channel_util_dom__WEBPACK_IMPORTED_MODULE_2__["ChannelUtilsDom"].createDomObservableFromEvent('mousewheel', ChannelWindow.getMouseWheelMapFn.bind(this)).debounceTime(debounceTime);
  }

  createScrollObservable(config) {
    var skipWhenDirIsMissing = function skipWhenDirIsMissing(evt) {
      return evt.scrollDistance === 0;
    };

    var debounceTime = config.debounceMSTimeForScroll;
    return _utils_channel_util_dom__WEBPACK_IMPORTED_MODULE_2__["ChannelUtilsDom"].createDomObservableFromEvent('scroll', ChannelWindow.getScrollMapFn.bind(this)).debounceTime(debounceTime).skipWhile(skipWhenDirIsMissing);
  }

  createOrientationObservable(config) {
    // console.log("add orientation");orientationchange
    return _utils_channel_util_dom__WEBPACK_IMPORTED_MODULE_2__["ChannelUtilsDom"].createDomObservableFromEvent('orientationchange', ChannelWindow.getOrientationMapFn.bind(this));
  }

  createResizeObservable(config) {
    var debounceTime = config.debounceMSTimeForResize; // console.log('resize this ', this);

    return _utils_channel_util_dom__WEBPACK_IMPORTED_MODULE_2__["ChannelUtilsDom"].createDomObservableFromEvent('resize', ChannelWindow.getResizeMapFn.bind(this)).debounceTime(debounceTime);
  }

  getEventsFromConfig(config) {
    if (config === void 0) {
      config = this.domChannelConfig;
    }

    var obs$Arr = config.events;

    var addWindowEventToArr = function addWindowEventToArr(str) {
      var mapFn = ChannelWindow.createCurriedGenericEvent(str);
      return _utils_channel_util_dom__WEBPACK_IMPORTED_MODULE_2__["ChannelUtilsDom"].createDomObservableFromEvent(str, mapFn);
    };

    return R.map(addWindowEventToArr, obs$Arr);
  }

  getActiveObservables(config) {
    if (config === void 0) {
      config = this.domChannelConfig;
    }

    var obs$Arr = []; // CHECK TO ADD MEDIA QUERY OBSERVABLE
    // ==========================================

    config['listenForMediaQueries'] = Object(_utils_frp_tools__WEBPACK_IMPORTED_MODULE_1__["checkIfObjIsNotEmptyOrNil"])(config.mediqQueries); // =========================================
    // config.listenForResize = false;
    // config.listenForMouseWheel = true;
    // config.listenForScroll = false;

    var methods = {
      'listenForResize': this.createResizeObservable.bind(this),
      'listenForOrientation': this.createOrientationObservable.bind(this),
      'listenForScroll': this.createScrollObservable.bind(this),
      'listenForMouseWheel': this.createMouseWheelObservable.bind(this)
    };

    var addObservableToArr = function addObservableToArr(method, key, i) {
      var addObsBool = config[key];

      if (addObsBool) {
        obs$Arr.push(method(config));
      } else {}
    };

    R.mapObjIndexed(addObservableToArr, methods); // 'listenForMediaQueries' : this.getMediaQueryObservable.bind(this)

    this.checkForMediaQueries(config.listenForMediaQueries);
    var eventsArr = this.getEventsFromConfig(config);
    obs$Arr = obs$Arr.concat(eventsArr);
    return obs$Arr;
  }

  checkForMediaQueries(bool) {
    var _this2 = this;

    var sendMQStream = function sendMQStream(p) {
      var action = p.action,
          channelPayload = p.channelPayload,
          srcElement = p.srcElement,
          event = p.event;

      _this2.sendStreamItem(action, channelPayload, srcElement, event, _this2.observer$);
    };

    if (bool === true) {
      this.getMediaQueryObservable(this.domChannelConfig).subscribe(sendMQStream);
    }
  }

  getMediaQueryObservable(config) {
    var _Rx$Observable2;

    var arr = this.createMergedObsFromObj(config);
    return (_Rx$Observable2 = Rx.Observable).merge.apply(_Rx$Observable2, arr).map(this.getMediaQueryMapFn.bind(this));
  }

  addRegisteredActions() {
    return ['CHANNEL_WINDOW_SCROLL_EVENT', 'CHANNEL_WINDOW_MOUSEWHEEL_EVENT', 'CHANNEL_WINDOW_MEDIA_QUERY_EVENT', 'CHANNEL_WINDOW_RESIZE_EVENT', 'CHANNEL_WINDOW_ORIENTATION_EVENT', 'CHANNEL_WINDOW_CACHED_EVENT', 'CHANNEL_WINDOW_ERROR_EVENT', 'CHANNEL_WINDOW_ABORT_EVENT', 'CHANNEL_WINDOW_LOAD_EVENT', 'CHANNEL_WINDOW_BEFOREUNLOAD_EVENT', 'CHANNEL_WINDOW_UNLOAD_EVENT', 'CHANNEL_WINDOW_ONLINE_EVENT', 'CHANNEL_WINDOW_OFFLINE_EVENT', 'CHANNEL_WINDOW_FOCUS_EVENT', 'CHANNEL_WINDOW_BLUR_EVENT', 'CHANNEL_WINDOW_OPEN_EVENT', 'CHANNEL_WINDOW_MESSAGE_EVENT', 'CHANNEL_WINDOW_ERROR_EVENT', 'CHANNEL_WINDOW_CLOSE_EVENT', 'CHANNEL_WINDOW_PAGEHIDE_EVENT', 'CHANNEL_WINDOW_PAGESHOW_EVENT', 'CHANNEL_WINDOW_POPSTATE_EVENT', 'CHANNEL_WINDOW_ANIMATIONSTART_EVENT', 'CHANNEL_WINDOW_ANIMATIONEND_EVENT', 'CHANNEL_WINDOW_ANIMATIONITERATION_EVENT', 'CHANNEL_WINDOW_TRANSITIONSTART_EVENT', 'CHANNEL_WINDOW_TRANSITIONCANCEL_EVENT', 'CHANNEL_WINDOW_TRANSITIONEND_EVENT', 'CHANNEL_WINDOW_TRANSITIONRUN_EVENT', 'CHANNEL_WINDOW_RESET_EVENT', 'CHANNEL_WINDOW_SUBMIT_EVENT', 'CHANNEL_WINDOW_BEFOREPRINT_EVENT', 'CHANNEL_WINDOW_AFTERPRINT_EVENT', 'CHANNEL_WINDOW_COMPOSITIONSTART_EVENT', 'CHANNEL_WINDOW_COMPOSITIONUPDATE_EVENT', 'CHANNEL_WINDOW_COMPOSITIONEND_EVENT', 'CHANNEL_WINDOW_FULLSCREENCHANGE_EVENT', 'CHANNEL_WINDOW_FULLSCREENERROR_EVENT', 'CHANNEL_WINDOW_CUT_EVENT', 'CHANNEL_WINDOW_COPY_EVENT'];
  }

  bindStaticMethods() {
    this.createMediaQueryHandler = _utils_channel_util_dom__WEBPACK_IMPORTED_MODULE_2__["ChannelUtilsDom"].createMediaQueryHandler.bind(this);
    this.createMergedObsFromObj = _utils_channel_util_dom__WEBPACK_IMPORTED_MODULE_2__["ChannelUtilsDom"].createMergedObsFromObj.bind(this);
  }

}

/***/ }),

/***/ "./src/spyne/channels/channels-base-controller.js":
/*!********************************************************!*\
  !*** ./src/spyne/channels/channels-base-controller.js ***!
  \********************************************************/
/*! exports provided: ChannelsBaseController */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChannelsBaseController", function() { return ChannelsBaseController; });
/* harmony import */ var _channel_route__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./channel-route */ "./src/spyne/channels/channel-route.js");
/* harmony import */ var _channel_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./channel-ui */ "./src/spyne/channels/channel-ui.js");
/* harmony import */ var _channel_window__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./channel-window */ "./src/spyne/channels/channel-window.js");
/* harmony import */ var _utils_channel_config_validator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/channel-config-validator */ "./src/spyne/utils/channel-config-validator.js");
// import {baseCoreMixins}    from '../utils/mixins/base-core-mixins';
// import {BaseStreamsMixins} from '../utils/mixins/base-streams-mixins';





var Rx = __webpack_require__(/*! rxjs */ "rxjs"); // const R = require('ramda');


class ChannelsBaseController {
  constructor(obs$) {
    this.addMixins();
    this.map = new Map(); // console.log('Rx is ',Rx);
    // console.log('RX IS ', Rx.Subject);

    this.map.set('DISPATCHER', new Rx.Subject());
  }

  init() {
    this.createMainStreams();
  }

  createObserver(obj) {
    // RIGHT NOW THIS CREATES THE DISPATCHER STREAM
    Object(_utils_channel_config_validator__WEBPACK_IMPORTED_MODULE_3__["validate"])(obj.validations, obj.init);
    this.map.set(obj.init.name, obj.init.observable());
  }

  createMainStreams() {
    this.routeValueeam = new _channel_route__WEBPACK_IMPORTED_MODULE_0__["ChannelRoute"]();
    this.map.set('ROUTE', this.routeValueeam);
    this.uiStream = new _channel_ui__WEBPACK_IMPORTED_MODULE_1__["ChannelUI"]();
    this.map.set('UI', this.uiStream);
    this.domStream = new _channel_window__WEBPACK_IMPORTED_MODULE_2__["ChannelWindow"]();
    this.map.set('WINDOW', this.domStream);
    this.routeValueeam.initializeStream();
    this.domStream.initializeStream();
  }

  addKeyEvent(key) {
    this.map.get('UI').addKeyEvent(key);
  }

  registerStream(name, val) {
    this.map.set(name, val);
    val.initializeStream();
  }

  getChannelActions(str) {
    return this.map.get(str).addRegisteredActions();
  }

  getStream(name) {
    if (this.map.get(name) === undefined) {
      console.warn("Spyne Warning: The Channel named \"" + name + "\" does not appear to be registered!");
    } else {
      return this.map.get(name);
    }
  }

  addMixins() {//  ==================================
    // BASE CORE DECORATORS
    //  ==================================
    // let coreMixins =  baseCoreMixins();
    //  ==================================
    // BASE STREAMS DECORATORS
    //  ==================================
    // let streamsMixins = BaseStreamsMixins();
  }

}

/***/ }),

/***/ "./src/spyne/channels/channels-base-data.js":
/*!**************************************************!*\
  !*** ./src/spyne/channels/channels-base-data.js ***!
  \**************************************************/
/*! exports provided: ChannelsBaseData */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChannelsBaseData", function() { return ChannelsBaseData; });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rxjs */ "rxjs");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(rxjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _channels_base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./channels-base */ "./src/spyne/channels/channels-base.js");
/* harmony import */ var _channel_stream_item__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./channel-stream-item */ "./src/spyne/channels/channel-stream-item.js");
/* harmony import */ var whatwg_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! whatwg-fetch */ "./node_modules/whatwg-fetch/fetch.js");
/* harmony import */ var whatwg_fetch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(whatwg_fetch__WEBPACK_IMPORTED_MODULE_3__);



 // const R = require('ramda');

class ChannelsBaseData extends _channels_base__WEBPACK_IMPORTED_MODULE_1__["ChannelsBase"] {
  constructor(props) {
    if (props === void 0) {
      props = {};
    }

    super(props);
    this.props = props;
    this.observer$ = new rxjs__WEBPACK_IMPORTED_MODULE_0___default.a.AsyncSubject();
    this.fetchData();
  }

  get observer() {
    return this.observer$;
  }

  addRegisteredActions() {
    return ['CHANNEL_DATA_EVENT'];
  }

  fetchData() {
    var _this = this;

    var mapFn = this.props.map !== undefined ? this.props.map : function (p) {
      return p;
    };

    var createChannelStreamItem = function createChannelStreamItem(payload) {
      var action = 'CHANNEL_DATA_EVENT';
      return new _channel_stream_item__WEBPACK_IMPORTED_MODULE_2__["ChannelStreamItem"](_this.props.name, action, payload);
    };

    var response$ = rxjs__WEBPACK_IMPORTED_MODULE_0___default.a.Observable.fromPromise(window.fetch(this.props.dataUrl)).flatMap(function (r) {
      return rxjs__WEBPACK_IMPORTED_MODULE_0___default.a.Observable.fromPromise(r.json());
    }).map(mapFn).map(createChannelStreamItem).multicast(this.observer$);
    response$.connect();
  }

}

/***/ }),

/***/ "./src/spyne/channels/channels-base.js":
/*!*********************************************!*\
  !*** ./src/spyne/channels/channels-base.js ***!
  \*********************************************/
/*! exports provided: ChannelsBase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChannelsBase", function() { return ChannelsBase; });
/* harmony import */ var _channels_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./channels-config */ "./src/spyne/channels/channels-config.js");
/* harmony import */ var _channel_stream_item__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./channel-stream-item */ "./src/spyne/channels/channel-stream-item.js");
/* harmony import */ var _utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/deep-merge */ "./src/spyne/utils/deep-merge.js");


 // import {baseCoreMixins}    from '../utils/mixins/base-core-mixins';
// import {BaseStreamsMixins} from '../utils/mixins/base-streams-mixins';

var Rx = __webpack_require__(/*! rxjs */ "rxjs");

var R = __webpack_require__(/*! ramda */ "ramda");

class ChannelsBase {
  constructor(props) {
    var _this = this;

    if (props === void 0) {
      props = {};
    }

    this.addMixins();
    this.addRegisteredActions.bind(this);
    this.createChannelActionsObj();
    var defaultName = {
      name: 'observer'
    };
    var observer$ = new Rx.Subject(); // this.props = Object.assign({}, defaultName, props);

    this.props = Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__["deepMerge"])(defaultName, props);
    this.observer$ = this.props['observer'] = observer$;
    this.streamsController = window.Spyne.channels; // getGlobalParam('streamsController');

    var dispatcherStream$ = this.streamsController.getStream('DISPATCHER');
    dispatcherStream$.subscribe(function (val) {
      return _this.onIncomingObservable(val);
    });
  }

  initializeStream() {}

  setTrace(bool) {}

  createChannelActionsObj() {
    var arr = this.addRegisteredActions();

    var converter = function converter(str) {
      return R.objOf(str, str);
    };

    var obj = R.mergeAll(R.chain(converter, arr));
    this.channelActions = obj;
  }

  addRegisteredActions() {
    return [];
  }

  get observer() {
    return this.observer$;
  }

  onIncomingObservable(obj) {
    var _this2 = this;

    var eqsName = R.equals(obj.name, this.props.name);

    var dataObj = function dataObj(obsVal) {
      return {
        observableData: obj.data,
        observableEvent: obsVal
      };
    };

    var onSuccess = function onSuccess(obj) {
      return obj.observable.map(dataObj).subscribe(_this2.onIncomingObserverableData.bind(_this2));
    };

    var onError = function onError() {};

    return eqsName === true ? onSuccess(obj) : onError();
  }

  onIncomingObserverableData(obj) {}

  sendStreamItem(action, payload, srcElement, event, obs$) {
    if (obs$ === void 0) {
      obs$ = this.observer$;
    }

    // MAKES ALL CHANNEL BASE AND DATA STREAMS CONSISTENT
    var channelStreamItem = new _channel_stream_item__WEBPACK_IMPORTED_MODULE_1__["ChannelStreamItem"](this.props.name, action, payload, srcElement, event);
    obs$.next(Object.freeze(channelStreamItem));
  }

  getChannel(channel) {
    var _this3 = this;

    var isValidChannel = function isValidChannel(c) {
      return Object(_channels_config__WEBPACK_IMPORTED_MODULE_0__["registeredStreamNames"])().includes(c);
    };

    var error = function error(c) {
      return console.warn("channel name " + c + " is not within " + _channels_config__WEBPACK_IMPORTED_MODULE_0__["registeredStreamNames"]);
    };

    var startSubscribe = function startSubscribe(c) {
      return _this3.streamsController.getStream(c).observer;
    };

    var fn = R.ifElse(isValidChannel, startSubscribe, error);
    return fn(channel);
  }

  addMixins() {//  ==================================
    // BASE CORE DECORATORS
    //  ==================================
    // let coreMixins =  baseCoreMixins();
    //  ==================================
    // BASE STREAMS DECORATORS
    //  ==================================
    // let streamsMixins = BaseStreamsMixins();
    // let testFunc = streamsMixins.testFunc;
  }

}

/***/ }),

/***/ "./src/spyne/channels/channels-config.js":
/*!***********************************************!*\
  !*** ./src/spyne/channels/channels-config.js ***!
  \***********************************************/
/*! exports provided: stepDisposeValidations, stepUpdateValidations, stepValidations, uiValidations, routeValidations, lifestreamValidations, registeredStreamNames, StreamsConfig */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stepDisposeValidations", function() { return stepDisposeValidations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stepUpdateValidations", function() { return stepUpdateValidations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stepValidations", function() { return stepValidations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uiValidations", function() { return uiValidations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "routeValidations", function() { return routeValidations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lifestreamValidations", function() { return lifestreamValidations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registeredStreamNames", function() { return registeredStreamNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StreamsConfig", function() { return StreamsConfig; });
/* harmony import */ var _utils_frp_tools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/frp-tools */ "./src/spyne/utils/frp-tools.js");
// import Spyne from '../spyne';


var R = __webpack_require__(/*! ramda */ "ramda");

var Rx = __webpack_require__(/*! rxjs */ "rxjs"); //console.log('channels config loaded ',R,Rx);


var registeredStreamNames = function registeredStreamNames() {
  return {
    includes: function includes() {
      return window.Spyne !== undefined ? Object(_utils_frp_tools__WEBPACK_IMPORTED_MODULE_0__["arrFromMapKeys"])(window.Spyne.channels.map) : ['ROUTE', 'UI', 'WINDOW', 'DISPATCHER'];
    }
  };
}; // getGlobalObj().channelsListArr;


var registeredSteps = ['LOAD', 'RENDER', 'MOUNT', 'UNMOUNT', 'DISPOSE', 'GARBAGE_COLLECT', 'UPDATE'];
var registeredLifeStreamTypes = ['parent', 'self', 'child', 'children', 'view'];
var registeredStreamTypes = ['Observable', 'BehaviorSubject', 'Subject', 'Observer', 'Subscriber', 'FromEventObservable'];
var registeredActions = ['subscribe', 'combineLatest'];

var getRxType = function getRxType(obs) {
  return obs().constructor.name;
}; // let getObservableType = (obs) => obs.constructor.name;


var confirmObservable = function confirmObservable(obs) {
  return obs.subscribe !== undefined;
}; // let pullMainRoute = (str) => str.replace(/^(\/?)(.*)(\/)(.*)/g, '$2');


var baseValidations = [],
    viewInfoValidations = [],
    uiValidations = [],
    lifestreamValidations = [],
    stepValidations = [],
    stepDisposeValidations = [],
    stepUpdateValidations = [],
    routeValidations = [],
    StreamsConfig = [];

if (R !== undefined && Rx !== undefined) {
  //  ===========================================================================
  // ALL VALIDATIONS ADD THE BASE VALIDATIONS THROUGH CONCATENATION
  //  ===========================================================================
  baseValidations = [{
    error: "need to match a valid name within " + registeredStreamTypes,
    predicate: function predicate(payload) {
      return registeredStreamNames().includes(payload.name);
    }
  }, {
    error: "param 'observable' must contain a valid Rx.Observable",
    // predicate: payload => registeredStreamTypes.includes(getObservableType(payload.observable))
    predicate: function predicate(payload) {
      return confirmObservable(payload.observable);
    }
  }, {
    error: 'param action must be a registered action',
    predicate: function predicate(payload) {
      return registeredActions.includes(payload.action);
    }
  }]; //  ===========================================================================
  // THESE VALIDATIONS ARE CONCATENATED WHEN THE OBSERVABLE REFERS TO A VIEW
  //  ===========================================================================

  viewInfoValidations = [{
    error: 'needs cid number in srcElement',
    predicate: R.compose(R.is(String), R.path(['data', 'srcElement', 'cid']))
  }, {
    error: 'needs a viewName in srcElement',
    predicate: R.compose(R.is(String), R.path(['data', 'srcElement', 'viewName']))
  }]; //  ===========================================================================
  // NO SPECIFIC UI VALIDATIONS AT THIS TIME -- IT JUST ADD OTHERS
  //  ===========================================================================

  uiValidations = function uiValidations() {
    var uiValidations = [];
    return uiValidations.concat(baseValidations).concat(viewInfoValidations);
  }; //  ===========================================================================
  // NO SPECIFIC LIFESTREAM VALIDATIONS AT THIS TIME -- IT JUST ADD OTHERS


  var lifeStreamValidations = [{
    error: "need to match a valid name within " + registeredStreamTypes,
    predicate: function predicate(payload) {
      return registeredStreamNames().includes(payload.name);
    }
  }, {
    error: "needs one of the following step strings: " + registeredSteps,
    predicate: function predicate(payload) {
      return registeredSteps.includes(payload.STEP);
    }
  }, {
    error: "type needs to one of the following: " + registeredLifeStreamTypes,
    predicate: function predicate(payload) {
      return registeredLifeStreamTypes.includes(payload.type);
    }
  }, {
    error: 'viewId needs to be added ',
    predicate: function predicate(payload) {
      return payload.viewId !== undefined;
    }
  }];

  stepValidations = function stepValidations() {
    var stepValidations = [];
    return stepValidations.concat(lifeStreamValidations);
  };

  stepDisposeValidations = function stepDisposeValidations() {
    var stepUpdateValidations = [{
      error: 'DISPOSE STEP requires a disposeItem param in the data object',
      predicate: function predicate(payload) {
        return payload.STEP === 'DISPOSE' && payload.data.disposeItems !== undefined;
      }
    }];
    return stepUpdateValidations.concat(lifeStreamValidations);
  };

  stepUpdateValidations = function stepUpdateValidations() {
    var stepUpdateValidations = [{
      error: 'UPDATE STEP requires a data object ',
      predicate: function predicate(payload) {
        return payload.STEP === 'UPDATE' && payload.data !== undefined;
      }
    }];
    return stepUpdateValidations.concat(lifeStreamValidations);
  }; //  ===========================================================================
  // lifestreamValidations
  //  ===========================================================================


  lifestreamValidations = function lifestreamValidations() {
    return lifeStreamValidations.concat(baseValidations).concat(viewInfoValidations);
  }; //  ===========================================================================
  // HERE IS THE ROUTE VALIDATIONS
  //  ===========================================================================


  routeValidations = function routeValidations() {
    var routeValidations = [
      /*
      *
      {
          error: `needs a valid route string within [${registeredRoutes}]`,
          predicate: payload => registeredRoutes.includes(pullMainRoute(payload.data.navigateTo))
      }
      *
      */
    ];
    return routeValidations.concat(baseValidations).concat(viewInfoValidations);
  }; //  ===========================================================================

  /*
  * THE IDEA OF StreamsConfig IS TO COMPLETELY GENERATE ALL APP STREAMS USING THIS OBJECT
  * THIS HAS NOT BEEN IMPLEMENTED -- MAY BE ADDED IN A FUTURE VERSION
  */
  //  ===========================================================================


  StreamsConfig = function StreamsConfig() {
    var streamValidations = [{
      error: "param 'name' must be of a registered type",
      predicate: function predicate(payload) {
        return registeredStreamNames().includes(payload.name);
      }
    }, {
      error: "param 'observable' must contain a valid Rx.Observable",
      predicate: function predicate(payload) {
        return registeredStreamTypes.includes(getRxType(payload.observable));
      }
    }, {
      error: 'param action must be a registered action',
      predicate: function predicate(payload) {
        return registeredActions.includes(payload.action);
      }
    }];
    return {
      streams: [{
        init: {
          name: 'DISPATCHER',
          observable: function observable() {
            return new Rx.Subject();
          },
          action: 'subscribe'
        },
        structure: {
          type: String,
          observable: Rx.Observable || Rx.Subject,
          action: String
        },
        validations: streamValidations
      }, {
        init: {
          name: 'UBU',
          observable: function observable() {
            return new Rx.Subject();
          },
          action: 'subscribe'
        },
        structure: {
          type: String,
          observable: Rx.Observable || Rx.Subject,
          action: String
        },
        validations: streamValidations
      }]
    };
  };
}



/***/ }),

/***/ "./src/spyne/channels/channels-payload.js":
/*!************************************************!*\
  !*** ./src/spyne/channels/channels-payload.js ***!
  \************************************************/
/*! exports provided: ChannelsPayload */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChannelsPayload", function() { return ChannelsPayload; });
/* harmony import */ var _channels_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./channels-config */ "./src/spyne/channels/channels-config.js");
/* harmony import */ var _utils_channel_config_validator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/channel-config-validator */ "./src/spyne/utils/channel-config-validator.js");
/* harmony import */ var _utils_gc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/gc */ "./src/spyne/utils/gc.js");
/* harmony import */ var _utils_frp_tools__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/frp-tools */ "./src/spyne/utils/frp-tools.js");
// import {baseCoreMixins} from '../utils/mixins/base-core-mixins';


 // import {Right, Left, findInObj} from '../utils/frp-tools';

 // const Rx = require('rxjs');

var R = __webpack_require__(/*! ramda */ "ramda");

class ChannelsPayload {
  constructor(name, observable, data, action, debug) {
    if (action === void 0) {
      action = 'subscribe';
    }

    if (debug === void 0) {
      debug = false;
    }

    this.addMixins();
    this.options = {
      "name": name,
      "observable": observable,
      "data": data,
      "action": action
    };
    this.getValidationChecks(name);
  }

  getValidationChecks(n) {
    var _this = this;

    var left = function left(e) {
      return console.warn(e);
    };

    var right = function right(val) {
      return _this.onRunValidations(val);
    };

    var channelMap = window.Spyne.channels.map;
    var obj = {
      UI: _channels_config__WEBPACK_IMPORTED_MODULE_0__["uiValidations"],
      ROUTE: _channels_config__WEBPACK_IMPORTED_MODULE_0__["uiValidations"],
      LIFESTREAM: _channels_config__WEBPACK_IMPORTED_MODULE_0__["uiValidations"]
    }; // console.log('channel map ',channelMap.has(n), n, channelMap);

    if (channelMap.has(n) === true) {
      return right(_channels_config__WEBPACK_IMPORTED_MODULE_0__["uiValidations"]);
    } else {
      return left('payload Needs a Valid Stream Name!'); //
    }
    /* return findInObj(obj, n, 'payload Needs a Valid Stream Name!')
       .fold(left, right);*/

  }

  onRunValidations(checks) {
    Object(_utils_channel_config_validator__WEBPACK_IMPORTED_MODULE_1__["validate"])(checks(), this.options).fold(this.onError.bind(this), this.onSuccess.bind(this));
  }

  onPayloadValidated(p) {
    this.sendToDirectorStream(p);
  }

  sendToDirectorStream(payload) {
    var streamsController = window.Spyne.channels; // getGlobalParam('streamsController');

    var directorStream$ = streamsController.getStream('DISPATCHER'); //console.log('payload is ',payload);

    directorStream$.next(payload);
    this.gc();
  }

  onError(errors) {
    console.warn('payload failed due to:\n' + errors.map(function (e) {
      return '* ' + e;
    }).join('\n'));
    this.gc();
  }

  onSuccess(payload) {
    this.onPayloadValidated(payload);
  }

  addMixins() {
    //  ==================================
    // BASE CORE MIXINS
    //  ==================================
    // let coreMixins = baseCoreMixins();
    this.gc = _utils_gc__WEBPACK_IMPORTED_MODULE_2__["gc"];
  }

}

/***/ }),

/***/ "./src/spyne/channels/lifestream-payload.js":
/*!**************************************************!*\
  !*** ./src/spyne/channels/lifestream-payload.js ***!
  \**************************************************/
/*! exports provided: LifestreamPayload */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LifestreamPayload", function() { return LifestreamPayload; });
/* harmony import */ var _channels_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./channels-config */ "./src/spyne/channels/channels-config.js");
/* harmony import */ var _utils_channel_config_validator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/channel-config-validator */ "./src/spyne/utils/channel-config-validator.js");
/* harmony import */ var _utils_gc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/gc */ "./src/spyne/utils/gc.js");
/* harmony import */ var _utils_frp_tools__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/frp-tools */ "./src/spyne/utils/frp-tools.js");
// import {baseCoreMixins} from '../utils/mixins/base-core-mixins';


 // import {Right, Left, findInObj} from '../utils/frp-tools';

 // const Rx = require('rxjs');
// const R = require('ramda');

class LifestreamPayload {
  constructor(name, STEP, type, viewId, data, debug) {
    if (data === void 0) {
      data = {};
    }

    if (debug === void 0) {
      debug = true;
    }

    this.addMixins();
    this.options = {
      name: name,
      STEP: STEP,
      type: type,
      viewId: viewId,
      data: data
    };
    this.getValidationChecks(STEP);
  }

  get data() {
    return this._data;
  }

  getValidationChecks(n) {
    var _this = this;

    var left = function left(e) {
      return console.warn(e);
    };

    var right = function right(val) {
      return _this.onRunValidations(val);
    };

    var obj = {
      LOAD: _channels_config__WEBPACK_IMPORTED_MODULE_0__["stepValidations"],
      RENDER: _channels_config__WEBPACK_IMPORTED_MODULE_0__["stepValidations"],
      MOUNT: _channels_config__WEBPACK_IMPORTED_MODULE_0__["stepValidations"],
      DISPOSE: _channels_config__WEBPACK_IMPORTED_MODULE_0__["stepDisposeValidations"],
      UNMOUNT: _channels_config__WEBPACK_IMPORTED_MODULE_0__["stepValidations"],
      GARBAGE_COLLECT: _channels_config__WEBPACK_IMPORTED_MODULE_0__["stepValidations"],
      UPDATE: _channels_config__WEBPACK_IMPORTED_MODULE_0__["stepUpdateValidations"]
    };
    return Object(_utils_frp_tools__WEBPACK_IMPORTED_MODULE_3__["findInObj"])(obj, n, 'lifestream payload Needs a Valid Stream Name!').fold(left, right);
  }

  onRunValidations(checks) {
    Object(_utils_channel_config_validator__WEBPACK_IMPORTED_MODULE_1__["validate"])(checks(), this.options).fold(this.onError.bind(this), this.onSuccess.bind(this));
  }

  onPayloadValidated(p) {
    this._data = p;
    return p;
  }

  onError(errors) {
    console.error('payload failed due to:\n' + errors.map(function (e) {
      return '* ' + e;
    }).join('\n'));
    this.gc();
  }

  onSuccess(payload) {
    this.onPayloadValidated(payload);
  }

  addMixins() {
    //  ==================================
    // BASE CORE MIXINS
    //  ==================================
    // let coreMixins = baseCoreMixins();
    this.gc = _utils_gc__WEBPACK_IMPORTED_MODULE_2__["gc"];
  }

}

/***/ }),

/***/ "./src/spyne/spyne.js":
/*!****************************!*\
  !*** ./src/spyne/spyne.js ***!
  \****************************/
/*! exports provided: ViewToDomMediator, ChannelsBase, ChannelsBaseData, ChannelsBaseController, ChannelsPayload, ChannelStreamItem, DomItem, ViewStream, ViewStreamBroadcaster, ViewStreamEnhancer, SpyneApp */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SpyneApp", function() { return SpyneApp; });
/* harmony import */ var _channels_channels_base_controller__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./channels/channels-base-controller */ "./src/spyne/channels/channels-base-controller.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ChannelsBaseController", function() { return _channels_channels_base_controller__WEBPACK_IMPORTED_MODULE_0__["ChannelsBaseController"]; });

/* harmony import */ var _views_dom_item__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./views/dom-item */ "./src/spyne/views/dom-item.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DomItem", function() { return _views_dom_item__WEBPACK_IMPORTED_MODULE_1__["DomItem"]; });

/* harmony import */ var _views_view_to_dom_mediator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./views/view-to-dom-mediator */ "./src/spyne/views/view-to-dom-mediator.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ViewToDomMediator", function() { return _views_view_to_dom_mediator__WEBPACK_IMPORTED_MODULE_2__["ViewToDomMediator"]; });

/* harmony import */ var _views_view_stream__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./views/view-stream */ "./src/spyne/views/view-stream.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ViewStream", function() { return _views_view_stream__WEBPACK_IMPORTED_MODULE_3__["ViewStream"]; });

/* harmony import */ var _views_view_stream_broadcaster__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./views/view-stream-broadcaster */ "./src/spyne/views/view-stream-broadcaster.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ViewStreamBroadcaster", function() { return _views_view_stream_broadcaster__WEBPACK_IMPORTED_MODULE_4__["ViewStreamBroadcaster"]; });

/* harmony import */ var _views_view_stream_enhancer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./views/view-stream-enhancer */ "./src/spyne/views/view-stream-enhancer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ViewStreamEnhancer", function() { return _views_view_stream_enhancer__WEBPACK_IMPORTED_MODULE_5__["ViewStreamEnhancer"]; });

/* harmony import */ var _channels_channels_payload__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./channels/channels-payload */ "./src/spyne/channels/channels-payload.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ChannelsPayload", function() { return _channels_channels_payload__WEBPACK_IMPORTED_MODULE_6__["ChannelsPayload"]; });

/* harmony import */ var _channels_channels_base__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./channels/channels-base */ "./src/spyne/channels/channels-base.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ChannelsBase", function() { return _channels_channels_base__WEBPACK_IMPORTED_MODULE_7__["ChannelsBase"]; });

/* harmony import */ var _channels_channels_base_data__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./channels/channels-base-data */ "./src/spyne/channels/channels-base-data.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ChannelsBaseData", function() { return _channels_channels_base_data__WEBPACK_IMPORTED_MODULE_8__["ChannelsBaseData"]; });

/* harmony import */ var _channels_channel_stream_item__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./channels/channel-stream-item */ "./src/spyne/channels/channel-stream-item.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ChannelStreamItem", function() { return _channels_channel_stream_item__WEBPACK_IMPORTED_MODULE_9__["ChannelStreamItem"]; });

/* harmony import */ var _utils_deep_merge__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utils/deep-merge */ "./src/spyne/utils/deep-merge.js");












class SpyneApp {
  constructor(config) {
    var _this = this;

    if (config === void 0) {
      config = {};
    }

    this.channels = new _channels_channels_base_controller__WEBPACK_IMPORTED_MODULE_0__["ChannelsBaseController"]();
    this.VERSION = '0.8.0';
    this.ViewStream = _views_view_stream__WEBPACK_IMPORTED_MODULE_3__["ViewStream"];
    this.BasicView = _views_view_to_dom_mediator__WEBPACK_IMPORTED_MODULE_2__["ViewToDomMediator"];
    this.DomItem = _views_dom_item__WEBPACK_IMPORTED_MODULE_1__["DomItem"];
    this.ViewStreamBroadcaster = _views_view_stream_broadcaster__WEBPACK_IMPORTED_MODULE_4__["ViewStreamBroadcaster"];
    this.ChannelsPayload = _channels_channels_payload__WEBPACK_IMPORTED_MODULE_6__["ChannelsPayload"];
    this.ChannelsBaseController = _channels_channels_base_controller__WEBPACK_IMPORTED_MODULE_0__["ChannelsBaseController"];
    this.ChannelsBase = _channels_channels_base__WEBPACK_IMPORTED_MODULE_7__["ChannelsBase"];
    this.ChannelStreamItem = _channels_channel_stream_item__WEBPACK_IMPORTED_MODULE_9__["ChannelStreamItem"];
    window.Spyne = this;
    var defaultConfig = {
      channels: {
        WINDOW: {
          mediqQueries: {
            /*  'test': '(max-width: 500px)',
              'newTest': '(max-width: 800px)'*/
          },
          events: [],
          listenForResize: true,
          listenForOrientation: true,
          listenForScroll: true,
          listenForMouseWheel: false,
          debounceMSTimeForResize: 200,
          debounceMSTimeForScroll: 150
        },
        ROUTE: {
          type: 'slash',
          isHash: false,
          isHidden: false,
          routes: {
            'route': {
              'keyword': 'change'
            }
          }
        }
      }
    };

    if (config !== undefined) {
      window.Spyne['config'] = Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_10__["deepMerge"])(defaultConfig, config); // Object.assign({}, defaultConfig, config);// config !== undefined ? config : defaultConfig;
      // console.log("CONFIG IS ",{defaultConfig, config},window.Spyne.config)
    }

    this.getChannelActions = function (str) {
      return window.Spyne.channels.getChannelActions(str);
    };

    this.registerChannel = function (str, val) {
      return _this.channels.registerStream(str, val);
    };

    this.registerDataChannel = function (obs$) {
      return _this.channels.registerStream(obs$.props.name, obs$);
    };

    var nullHolder = new _views_view_stream__WEBPACK_IMPORTED_MODULE_3__["ViewStream"]({
      id: 'spyne-null-views'
    });
    nullHolder.appendToDom(document.body);
    nullHolder.props.el.style.cssText = 'display:none; opacity:0; pointer-events:none;';
    this.channels.init(); // window.Spyne.channels.init();
  }

  static getChannelActions(str) {
    return window.Spyne.channels.getChannelActions(str);
  }

  static registerChannel(str, val) {
    if (window.Spyne === undefined) {
      console.warn('Spyne has not been initialized');
    } else {
      return window.Spyne.channels.registerStream(str, val);
    }
  }

} // let Spyne = {ViewToDomMediator, ChannelsBase, ChannelsBaseController, ChannelsPayload, DomItem, ViewStream, ViewStreamBroadcaster, registerChannel};


window['Spyne'] = SpyneApp;


/***/ }),

/***/ "./src/spyne/utils/channel-config-validator.js":
/*!*****************************************************!*\
  !*** ./src/spyne/utils/channel-config-validator.js ***!
  \*****************************************************/
/*! exports provided: validate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validate", function() { return validate; });
/* harmony import */ var data_validation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! data.validation */ "./node_modules/data.validation/lib/index.js");
/* harmony import */ var data_validation__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(data_validation__WEBPACK_IMPORTED_MODULE_0__);


var R = __webpack_require__(/*! ramda */ "ramda"); //import { curry, curryN, reduce, length, always } from 'ramda';


var success = data_validation__WEBPACK_IMPORTED_MODULE_0___default.a.Success;
var failure = data_validation__WEBPACK_IMPORTED_MODULE_0___default.a.Failure;

var validate = function validate() {};

if (R !== undefined) {
  validate = R.curry(function (validations, thing) {
    var initial = success(R.curryN(R.length(validations), R.always(thing)));

    var run = function run(acc, v) {
      return acc.ap(v.predicate(thing) ? success(thing) : failure([v.error]));
    };

    return R.reduce(run, initial, validations);
  });
}



/***/ }),

/***/ "./src/spyne/utils/channel-util-dom.js":
/*!*********************************************!*\
  !*** ./src/spyne/utils/channel-util-dom.js ***!
  \*********************************************/
/*! exports provided: ChannelUtilsDom */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChannelUtilsDom", function() { return ChannelUtilsDom; });
var Rx = __webpack_require__(/*! rxjs */ "rxjs");

var R = __webpack_require__(/*! ramda */ "ramda");

class ChannelUtilsDom {
  constructor() {
    this.createDomObservableFromEvent = ChannelUtilsDom.createDomObservableFromEvent.bind(this);
  }

  static createDomObservableFromEvent(eventName, mapFn, isPassive) {
    if (isPassive === void 0) {
      isPassive = true;
    }

    var addHandler = function addHandler(handler) {
      return window.addEventListener(eventName, handler, {
        passive: isPassive
      });
    };

    var removeHandler = function removeHandler() {
      window[eventName] = function (p) {
        return p;
      };
    };

    mapFn = mapFn === undefined ? function (p) {
      return p;
    } : mapFn;
    return Rx.Observable.fromEventPattern(addHandler, removeHandler).map(mapFn);
  } // MEDIA QUERIES


  static createMediaQuery(str) {
    var mq = window.matchMedia(str);
    this.checkIfValidMediaQuery(mq, str);
    return mq;
  }

  static checkIfValidMediaQuery(mq, str) {
    var noSpaces = function noSpaces(str) {
      return str.replace(/\s+/gm, '');
    };

    var isValidBool = mq.constructor.name === 'MediaQueryList' && noSpaces(mq.media) === noSpaces(str);

    var warnMsg = function warnMsg(str) {
      return console.warn("Spyne Warning: the following query string, \"" + str + "\", does not match \"" + mq.media + "\" and may not be a valid Media Query item!");
    };

    if (isValidBool === false) {
      warnMsg(str);
    }

    return isValidBool;
  }

  static createMediaQueryHandler(query, key) {
    var keyFn = function keyFn(key) {
      return function (p) {
        p['mediaQueryName'] = key;
        return p;
      };
    };

    var mapKey = keyFn(key);

    var handlers = function handlers(q) {
      return {
        addHandler: function addHandler(handler) {
          q.onchange = handler;
        },
        removeHandler: function removeHandler(handler) {
          q.onchange = function () {};
        }
      };
    };

    var mediaQueryHandler = handlers(query);
    return new Rx.Observable.fromEventPattern(mediaQueryHandler.addHandler, mediaQueryHandler.removeHandler).map(mapKey);
  }

  static createMergedObsFromObj(config) {
    var mediaQueriesObj = config.mediqQueries;
    var arr = [];

    var loopQueries = function loopQueries(val, key, obj) {
      var mq = ChannelUtilsDom.createMediaQuery(val);
      arr.push(ChannelUtilsDom.createMediaQueryHandler(mq, key)); // return arr;
    };

    R.mapObjIndexed(loopQueries, mediaQueriesObj); // let obs$ = Rx.Observable.merge(...arr);
    // console.log('arr is ',arr);

    return arr;
  }

}

/***/ }),

/***/ "./src/spyne/utils/channel-util-route.js":
/*!***********************************************!*\
  !*** ./src/spyne/utils/channel-util-route.js ***!
  \***********************************************/
/*! exports provided: RouteUtils */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RouteUtils", function() { return RouteUtils; });
var R = __webpack_require__(/*! ramda */ "ramda");

var Rx = __webpack_require__(/*! rxjs */ "rxjs");

class RouteUtils {
  constructor() {
    this.createPopStateStream = RouteUtils.createPopStateStream.bind(this);
  }

  static createPopStateStream(subscribeFn) {
    var addHandler = function addHandler(handler) {
      window.onpopstate = handler;
    };

    var removeHandler = function removeHandler() {
      window.onpopstate = function () {};
    };

    var popupObs$ = Rx.Observable.fromEventPattern(addHandler, removeHandler);
    popupObs$.subscribe(subscribeFn);
  }

  static getLastArrVal(arr) {
    var getLastParam = function getLastParam(a) {
      return R.last(a) !== undefined ? R.last(a) : '';
    };

    return getLastParam(arr);
  }

  static getRouteArrData(routeArr, paramsArr) {
    var routeKeywordsArr = R.filter(R.contains(R.__, routeArr), paramsArr);
    var routeKeyword = RouteUtils.getLastArrVal(routeKeywordsArr); // console.log('arr and keyword ',{routeKeywordsArr, routeKeyword});

    return {
      routeKeywordsArr: routeKeywordsArr,
      routeKeyword: routeKeyword
    };
  }

  static flattenConfigObject(obj) {
    var go = function go(obj_) {
      return R.chain(function (_ref) {
        var k = _ref[0],
            v = _ref[1];

        if (Object.prototype.toString.call(v) === '[object Object]') {
          return R.map(function (_ref2) {
            var k_ = _ref2[0],
                v_ = _ref2[1];
            return [k + "." + k_, v_];
          }, go(v));
        } else {
          return [[k, v]];
        }
      }, R.toPairs(obj_));
    };

    return R.values(R.fromPairs(go(obj)));
  }

  static getLocationData() {
    var locationParamsArr = ['href', 'origin', 'protocol', 'host', 'hostname', 'port', 'pathname', 'search', 'hash'];
    return R.pickAll(locationParamsArr, window.location);
  }

}

/***/ }),

/***/ "./src/spyne/utils/channel-util-urls.js":
/*!**********************************************!*\
  !*** ./src/spyne/utils/channel-util-urls.js ***!
  \**********************************************/
/*! exports provided: URLUtils */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "URLUtils", function() { return URLUtils; });
var R = __webpack_require__(/*! ramda */ "ramda");

class URLUtils {
  constructor() {
    this.checkIfObjIsNotEmptyOrNil = URLUtils.checkIfObjIsNotEmptyOrNil.bind(this);
  }

  static checkIfObjIsNotEmptyOrNil(obj) {
    var isNotEmpty = R.compose(R.complement(R.isEmpty), R.head, R.values);
    var isNotNil = R.compose(R.complement(R.isNil), R.head, R.values);
    var isNotNilAndIsNotEmpty = R.allPass([isNotEmpty, isNotNil]);
    return isNotNilAndIsNotEmpty(obj);
  }

  static checkIfParamValueMatchesRegex(paramValue, routeObj) {
    var rejectParamKey = R.reject(R.equals('keyword'));
    var keysArr = R.compose(rejectParamKey, R.keys);

    var testForRegexMatch = function testForRegexMatch(str) {
      return R.test(new RegExp(str), paramValue);
    };

    var checker = R.compose(R.find(testForRegexMatch), keysArr);
    var regexMatchStr = checker(routeObj);

    if (R.is(String, regexMatchStr)) {
      routeObj = R.assoc(paramValue, R.prop(regexMatchStr, routeObj), routeObj);
    }

    return routeObj;
  }

  static getLocationStrByType(t, isHash) {
    if (isHash === void 0) {
      isHash = false;
    }

    var type = isHash === true ? 'hash' : t;
    var typeMap = {
      'slash': 'pathname',
      'query': 'search',
      'hash': 'hash'
    };
    var prop = typeMap[type];
    var str = R.prop(prop, window.location);
    var checkForSlashAndHash = /^(\/)?(#)?(\/)?(.*)$/;
    return str.replace(checkForSlashAndHash, '$4');
  }

  static createRouteArrayFromParams(data, route, t, paramsFromLoc) {
    var _this = this;

    if (t === void 0) {
      t = 'slash';
    }

    var urlArr = [];

    var loopThroughParam = function loopThroughParam(routeObj) {
      var urlObj = {};
      var keyword = routeObj.keyword; // PARAM FORM SPYNE CONFIG

      var paramValFromData = data[keyword] !== undefined ? data[keyword] : R.prop(keyword, paramsFromLoc); // PULL VALUE FOR THIS PARAM FROM DATA

      var paramValType = typeof routeObj[paramValFromData]; // console.log({routeObj, paramValType, paramValFromData, keyword})

      if (paramValType === 'string') {
        paramValFromData = routeObj[paramValFromData];
      } else if (paramValType === 'undefined') {
        routeObj = _this.checkIfParamValueMatchesRegex(paramValFromData, routeObj);
      }

      urlObj[keyword] = paramValFromData; // console.log("URL OBJ ",urlObj);

      if (_this.checkIfObjIsNotEmptyOrNil(urlObj)) {
        // console.log("FOUND ",{paramValFromData, paramValType, urlObj, routeObj});
        urlArr.push(urlObj);
      } else {// console.log("NOT FOUND ",paramValFromData, paramValType, urlObj, routeObj);
      }

      var isObject = R.is(Object, routeObj);
      var objectParamExists = R.has(paramValFromData, routeObj);
      var objectContainsRoute = R.has('route', routeObj);
      var recursivelyCallLoopBool = objectParamExists && isObject; // console.log("CHECKS ", {isObject, objectParamExists, objectContainsRoute, recursivelyCallLoopBool})

      if (recursivelyCallLoopBool === true) {
        var newObj = routeObj[paramValFromData]; // console.log("NEW OBJ ",{paramValFromData, routeObj, newObj});

        if (R.has('route', newObj)) {
          loopThroughParam(newObj.route);
        }
      } else if (objectContainsRoute === true && paramValFromData !== undefined) {
        loopThroughParam(routeObj.route);
      }
    };

    loopThroughParam(route);
    return urlArr;
  }

  static createSlashString(arr) {
    var arrClear = R.reject(R.isNil);
    var notUndefined = R.when(R.complement(R.isNil, R.__), R.join('/'));
    var joiner = R.compose(notUndefined, arrClear, R.flatten, R.map(R.values));
    return joiner(arr);
  }

  static createQueryString(arr) {
    var arrClear = R.reject(R.isNil);
    var isNotNilAndIsNotEmpty = this.checkIfObjIsNotEmptyOrNil;
    var createPair = R.compose(R.join('='), R.flatten, R.toPairs);
    var checkPair = R.ifElse(isNotNilAndIsNotEmpty, createPair, R.always(undefined));
    var mapArrayOfPairs = R.map(checkPair);
    var checkIfStrIsEmpty = R.when(R.complement(R.isEmpty), R.concat('?'));
    var createQs = R.compose(checkIfStrIsEmpty, R.join('&'), arrClear, mapArrayOfPairs);
    return createQs(arr);
  }

  static convertParamsToRoute(data, r, t, locStr) {
    if (r === void 0) {
      r = window.Spyne.config.channels.ROUTE;
    }

    var urlType = t !== undefined ? t : r.type;
    var isHash = r.isHash;
    var route = r.routes.route;
    var locationStr = locStr !== undefined ? locStr : this.getLocationStrByType(urlType, isHash);
    var paramsFromCurrentLocation = this.convertRouteToParams(locationStr, r, urlType).keywords;
    var urlArr = this.createRouteArrayFromParams(data, route, urlType, paramsFromCurrentLocation); // THIS CREATES A QUERY PATH STR

    if (urlType === 'query') {
      return this.createQueryString(urlArr);
    } // THIS CREATES A SLASH PATH STR


    return this.createSlashString(urlArr);
  }

  static checkIfValueShouldMapToParam(obj, str) {
    var invertedObj = R.invert(obj);
    var checkIfValMapsToParam = R.compose(R.is(String), R.head, R.defaultTo([]), R.prop(str));
    var getParam = R.compose(R.head, R.prop(str));
    var strCheck = R.ifElse(checkIfValMapsToParam, getParam, R.always(str));
    return strCheck(invertedObj);
  }

  static createArrFromSlashStr(str) {
    var slashRe = /^([/])?(.*)$/;
    return str.replace(slashRe, '$2').split('/');
  }

  static convertSlashRouteStrToParamsObj(topLevelRoute, str) {
    var _this2 = this;

    var routeValue = str;
    var valuesArr = this.createArrFromSlashStr(str);
    var routeKeywordsArr = [];
    var routedValuesArr = [];
    var latestObj = topLevelRoute;

    var createParamsFromStr = function createParamsFromStr(total, currentValue) {
      var routeValueStr = _this2.checkIfValueShouldMapToParam(latestObj, currentValue);

      latestObj = _this2.checkIfParamValueMatchesRegex(currentValue, latestObj);

      if (latestObj !== undefined) {
        routeKeywordsArr.push(latestObj.keyword);
        routedValuesArr.push(routeValueStr);
      }

      var strPath = [currentValue, 'route'];
      var routeParamPath = ['route'];
      var objectFromStr = R.path(strPath, latestObj);
      var objectFromRouteParam = R.path(routeParamPath, latestObj);

      if (objectFromStr !== undefined) {
        latestObj = objectFromStr;
      } else if (objectFromRouteParam !== undefined) {
        latestObj = objectFromRouteParam;
      }
    };

    R.reduce(createParamsFromStr, 0, valuesArr);
    var keywords = R.zipObj(routeKeywordsArr, routedValuesArr);
    var routeKeyword = this.getLastArrVal(routeKeywordsArr);
    return {
      routeKeywordsArr: routeKeywordsArr,
      routeKeyword: routeKeyword,
      keywords: keywords,
      routeValue: routeValue
    };
  }

  static getLastArrVal(arr) {
    var getLastParam = function getLastParam(a) {
      return R.last(a) !== undefined ? R.last(a) : '';
    };

    return getLastParam(arr);
  }

  static createDefaultParamFromEmptyStr(topLevelRoute, str) {
    var obj = {};
    var keyword = topLevelRoute.keyword;
    obj[keyword] = this.checkIfValueShouldMapToParam(topLevelRoute, str);
    return obj;
  }

  static convertQueryStrToParams(topLevelRoute, str) {
    var queryRe = /^([?])?(.*)$/;
    var routeValue = str;
    var strArr = str.replace(queryRe, '$2');
    var convertToParams = R.compose(R.map(R.split('=')), R.split('&'));
    var paramsArr = convertToParams(strArr);
    var keywords = R.fromPairs(paramsArr);
    var routeKeywordsArr = R.map(R.head, paramsArr);

    if (R.isEmpty(str) === true) {
      keywords = this.createDefaultParamFromEmptyStr(topLevelRoute, str);
      routeKeywordsArr = R.keys(keywords);
    }

    var routeKeyword = this.getLastArrVal(routeKeywordsArr);
    return {
      routeKeywordsArr: routeKeywordsArr,
      routeKeyword: routeKeyword,
      keywords: keywords,
      routeValue: routeValue
    };
  }

  static convertRouteToParams(str, routeConfig, t) {
    if (routeConfig === undefined) {
      return {};
    }

    var type = t !== undefined ? t : routeConfig.type;
    var topLevelRoute = routeConfig.routes.route;

    if (type === 'query') {
      return this.convertQueryStrToParams(topLevelRoute, str);
    }

    return this.convertSlashRouteStrToParamsObj(topLevelRoute, str);
  }

}

/***/ }),

/***/ "./src/spyne/utils/deep-merge.js":
/*!***************************************!*\
  !*** ./src/spyne/utils/deep-merge.js ***!
  \***************************************/
/*! exports provided: deepMerge */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deepMerge", function() { return deepMerge; });
function isMergeableObject(val) {
  var nonNullObject = val && typeof val === 'object';
  return nonNullObject && Object.prototype.toString.call(val) !== '[object RegExp]' && Object.prototype.toString.call(val) !== '[object Date]';
}

function emptyTarget(val) {
  return Array.isArray(val) ? [] : {};
}

function cloneIfNecessary(value, optionsArgument) {
  var clone = optionsArgument && optionsArgument.clone === true;
  return clone && isMergeableObject(value) ? deepMerge(emptyTarget(value), value, optionsArgument) : value;
}

function defaultArrayMerge(target, source, optionsArgument) {
  var destination = target.slice();
  source.forEach(function (e, i) {
    if (typeof destination[i] === 'undefined') {
      destination[i] = cloneIfNecessary(e, optionsArgument);
    } else if (isMergeableObject(e)) {
      destination[i] = deepMerge(target[i], e, optionsArgument);
    } else if (target.indexOf(e) === -1) {
      destination.push(cloneIfNecessary(e, optionsArgument));
    }
  });
  return destination;
}

function mergeObject(target, source, optionsArgument) {
  var destination = {};

  if (isMergeableObject(target)) {
    Object.keys(target).forEach(function (key) {
      destination[key] = cloneIfNecessary(target[key], optionsArgument);
    });
  }

  Object.keys(source).forEach(function (key) {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneIfNecessary(source[key], optionsArgument);
    } else {
      destination[key] = deepMerge(target[key], source[key], optionsArgument);
    }
  });
  return destination;
}

function deepMerge(target, source, optionsArgument) {
  var array = Array.isArray(source);
  var options = optionsArgument || {
    arrayMerge: defaultArrayMerge
  };
  var arrayMerge = options.arrayMerge || defaultArrayMerge;

  if (array) {
    return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument);
  } else {
    return mergeObject(target, source, optionsArgument);
  }
}

deepMerge.all = function deepmergeAll(array, optionsArgument) {
  if (!Array.isArray(array) || array.length < 2) {
    throw new Error('first argument should be an array with at least two elements');
  } // we are sure there are at least 2 values, so it is safe to have no initial value


  return array.reduce(function (prev, next) {
    return deepMerge(prev, next, optionsArgument);
  });
};



/***/ }),

/***/ "./src/spyne/utils/frp-tools.js":
/*!**************************************!*\
  !*** ./src/spyne/utils/frp-tools.js ***!
  \**************************************/
/*! exports provided: getConstructorName, arrFromMapKeys, getAllMethodNames, findStrOrRegexMatchStr, findStrFromRegexArr, checkIfObjIsNotEmptyOrNil, isIOS, pullRouteInfo, pullTranslateYFromHeader, pullSlashFromPath, pullHashAndSlashFromPath, closest, pullTranslateY, pullTranslateX, pullMainRoute, pullParams, right, left, fromNullable, findInObj, ifNilThenUpdate, removeSlashes, subscribeFn, convertDomStringMapToObj */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getConstructorName", function() { return getConstructorName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "arrFromMapKeys", function() { return arrFromMapKeys; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAllMethodNames", function() { return getAllMethodNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findStrOrRegexMatchStr", function() { return findStrOrRegexMatchStr; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findStrFromRegexArr", function() { return findStrFromRegexArr; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkIfObjIsNotEmptyOrNil", function() { return checkIfObjIsNotEmptyOrNil; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isIOS", function() { return isIOS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pullRouteInfo", function() { return pullRouteInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pullTranslateYFromHeader", function() { return pullTranslateYFromHeader; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pullSlashFromPath", function() { return pullSlashFromPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pullHashAndSlashFromPath", function() { return pullHashAndSlashFromPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "closest", function() { return closest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pullTranslateY", function() { return pullTranslateY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pullTranslateX", function() { return pullTranslateX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pullMainRoute", function() { return pullMainRoute; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pullParams", function() { return pullParams; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "right", function() { return right; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "left", function() { return left; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromNullable", function() { return fromNullable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findInObj", function() { return findInObj; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ifNilThenUpdate", function() { return ifNilThenUpdate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeSlashes", function() { return removeSlashes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subscribeFn", function() { return subscribeFn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertDomStringMapToObj", function() { return convertDomStringMapToObj; });
var _this2 = undefined;

var R = __webpack_require__(/*! ramda */ "ramda");

var isIOS = function isIOS() {
  var userAgent = window.navigator.userAgent.toLowerCase(); // let safari = /safari/.test(userAgent);

  var ios = /iphone|ipod|ipad/.test(userAgent);
  return ios === true;
};

var getConstructorName = function getConstructorName(obj) {
  if (obj.constructor.name !== undefined) {
    return obj.constructor.name;
  }

  var re = /^(function\s)(\w+)(\(.*)$/;
  var str = obj.toString();
  return R.defaultTo(String(str).substr(0, 12), R.match(re, str)[2]);
};

var arrFromMapKeys = function arrFromMapKeys(map) {
  var arr = [];

  var addKeysToArr = function addKeysToArr(v, k, i) {
    return arr.push(k);
  };

  R.forEach(addKeysToArr, map);
  return arr;
};

var findStrFromRegexArr = function findStrFromRegexArr(obj, str) {
  if (obj[str] !== undefined) {
    return str;
  }

  var checkIfMatch = function checkIfMatch(s) {
    return R.test(new RegExp(s), str);
  };

  var checkStrMatch = R.contains(str);
  var checkIfRegExMatch = R.compose(R.contains(true), R.map(checkIfMatch));
  var runMatchChecks = R.cond([[checkStrMatch, function () {
    return str;
  }], [checkIfRegExMatch, function () {
    return str;
  }], [R.T, function () {
    return undefined;
  }]]);
  return runMatchChecks(obj);
};

var findStrOrRegexMatchStr = function findStrOrRegexMatchStr(obj, str) {
  if (obj[str] !== undefined) {
    return str;
  }

  var createRe = function createRe(s) {
    return new RegExp(s);
  };

  var checkerIfRegexMatchExists = R.compose(R.head, R.filter(R.compose(R.test(R.__, str), createRe)));
  return checkerIfRegexMatchExists(R.keys(obj));
};

var closest = function closest(array, num) {
  var i = 0;
  var minDiff = 1000;
  var ans;

  for (i in array) {
    var m = Math.abs(num - array[i]);

    if (m < minDiff) {
      minDiff = m;
      ans = array[i];
    }
  }

  return ans;
};

var convertDomStringMapToObj = function convertDomStringMapToObj(domMap) {
  var obj = {};

  for (var d in domMap) {
    obj[d] = domMap[d];
  }

  return obj;
}; // const passPageData = R.pick(['params', 'routeId', 'data'], R.__);


var subscribeFn = {
  next: function next(x) {
    return console.log("next      " + x);
  },
  error: function error(x) {
    return console.log("error     " + x);
  },
  complete: function complete(x) {
    return console.log("complete  " + x);
  }
};

var right = function right(x) {
  return {
    map: function map(f) {
      return right(f(x));
    },
    fold: function fold(f, g) {
      return g(x);
    },
    inspect: function inspect() {
      return "right(" + x + ")";
    }
  };
};

var ifNilThenUpdate = function ifNilThenUpdate(val, newVal) {
  var isNil = R.isNil(val);
  return isNil ? newVal : val;
};

var left = function left(x) {
  return {
    map: function map(f) {
      return left(x);
    },
    fold: function fold(f, g) {
      return f(x);
    },
    inspect: function inspect() {
      return "left(" + x + ")";
    }
  };
};

var checkIfObjIsNotEmptyOrNil = function checkIfObjIsNotEmptyOrNil(obj) {
  var isNotEmpty = R.compose(R.complement(R.isEmpty), R.head, R.values);
  var isNotNil = R.compose(R.complement(R.isNil), R.head, R.values);
  var isNotNilAndIsNotEmpty = R.allPass([isNotEmpty, isNotNil]);
  return isNotNilAndIsNotEmpty(obj);
};

var fromNullable = function fromNullable(x) {
  return x !== null ? right(x) : left(null);
};

var findInObj = function findInObj(obj, val, error) {
  if (error === void 0) {
    error = null;
  }

  var found = obj[val];
  return found ? right(found) : left(error);
};

var pullRouteInfo = function pullRouteInfo() {
  var str = pullHashAndSlashFromPath(window.location.hash);
  var routeId = pullMainRoute(str);
  var params = pullParams(str);
  return {
    routeId: routeId,
    params: params
  };
};

var getAllMethodNames = function getAllMethodNames(_this, omittedMethods) {
  if (_this === void 0) {
    _this = _this2;
  }

  if (omittedMethods === void 0) {
    omittedMethods = [];
  }

  var getPropNamesArr = function getPropNamesArr(obj, omittedMethods) {
    if (obj === void 0) {
      obj = _this2;
    }

    if (omittedMethods === void 0) {
      omittedMethods = [];
    }

    return Object.getOwnPropertyNames(obj);
  }; // Filter Methods


  var baseClassMethodsArr = ['length', 'name', 'prototype', 'constructor'];
  omittedMethods = R.concat(baseClassMethodsArr, omittedMethods);
  var omitPropsFromArr = R.compose(R.without(omittedMethods), R.uniq); // PULL OUT METHOD NAMES

  var methods = omitPropsFromArr(Object.getOwnPropertyNames(_this.constructor.prototype));
  var staticMethods = omitPropsFromArr(getPropNamesArr(_this.constructor));
  var allMethods = R.concat(methods, staticMethods);
  return {
    methods: methods,
    staticMethods: staticMethods,
    allMethods: allMethods
  }; // return 'fn';
}; // ROUTE REGEX EXPRESSIONS


var removeSlashes = function removeSlashes(str) {
  return str.replace(/^(\/)(.*)/g, '$2');
};

var routeRE = /^(\/?)(\w*)(\/?)(.*)/g;

var pullHashAndSlashFromPath = function pullHashAndSlashFromPath(str) {
  return str.replace(/^(#\/?)(.*)/, '$2');
};

var pullSlashFromPath = function pullSlashFromPath(str) {
  return str.replace(/^(\/?)(.*)/, '$2');
};

var pullMainRoute = function pullMainRoute(str) {
  return str.replace(routeRE, '$2');
};

var pullParams = function pullParams(str) {
  return str.replace(routeRE, '$4');
};

var pullTranslateX = function pullTranslateX(str) {
  return str.replace(/^(matrix)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*)(,.*)/, '$6');
};

var pullTranslateY = function pullTranslateY(str) {
  return str.replace(/^(matrix)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d)(.*)/, '$7');
};

var pullTranslateYFromHeader = function pullTranslateYFromHeader(str) {
  return str.replace(/^(transform: matrix)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*,)(.*\d*)(\).*;)/, '$6');
};



/***/ }),

/***/ "./src/spyne/utils/gc.js":
/*!*******************************!*\
  !*** ./src/spyne/utils/gc.js ***!
  \*******************************/
/*! exports provided: gc */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "gc", function() { return gc; });
var R = __webpack_require__(/*! ramda */ "ramda");

function gc() {
  var _this = this;

  var cleanup = function cleanup() {
    var loopM = function loopM(m) {
      return void 0;
    };

    R.forEach(loopM, _this);
  };

  setTimeout(cleanup, 1);
}

/***/ }),

/***/ "./src/spyne/utils/mixins/base-core-mixins.js":
/*!****************************************************!*\
  !*** ./src/spyne/utils/mixins/base-core-mixins.js ***!
  \****************************************************/
/*! exports provided: baseCoreMixins */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "baseCoreMixins", function() { return baseCoreMixins; });
function baseCoreMixins() {
  return {
    createpropsMap: function createpropsMap() {
      var wm = new WeakMap();
      var objKey = {
        cid: this.props.cid
      };
      wm.set(objKey, this.props);
      return {
        key: objKey,
        weakMap: wm
      };
    },
    gc: function gc() {
      for (var m in this) {
        delete this[m];
      }

      delete this;
    },
    createId: function createId() {
      var num = Math.floor(Math.random(10000000) * 10000000);
      return "cid-" + num;
    },
    setTraceFunc: function setTraceFunc(debug) {
      return debug === true ? console.log : function () {};
    }
  };
}

/***/ }),

/***/ "./src/spyne/utils/mixins/base-streams-mixins.js":
/*!*******************************************************!*\
  !*** ./src/spyne/utils/mixins/base-streams-mixins.js ***!
  \*******************************************************/
/*! exports provided: baseStreamsMixins */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "baseStreamsMixins", function() { return baseStreamsMixins; });
/* harmony import */ var _channels_channels_payload__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../channels/channels-payload */ "./src/spyne/channels/channels-payload.js");
/* harmony import */ var _channels_lifestream_payload__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../channels/lifestream-payload */ "./src/spyne/channels/lifestream-payload.js");



var R = __webpack_require__(/*! ramda */ "ramda");

var Rx = __webpack_require__(/*! rxjs */ "rxjs");

function baseStreamsMixins() {
  return {
    testFunc: function testFunc(str) {
      console.log('stream mixin is ', str);
    },
    sendRoutePayload: function sendRoutePayload(obs, data) {
      return new _channels_channels_payload__WEBPACK_IMPORTED_MODULE_0__["ChannelsPayload"]('ROUTE', obs, data, 'subscribe');
    },
    sendUIPayload: function sendUIPayload(obs, data) {
      return new _channels_channels_payload__WEBPACK_IMPORTED_MODULE_0__["ChannelsPayload"]('UI', obs, data, 'subscribe');
    },
    sendChannelPayload: function sendChannelPayload(channelName, payload) {
      var _this = this;

      var getProp = function getProp(str) {
        return R.prop(str, _this.props);
      };

      var channel = channelName;
      var srcElement = {
        cid: getProp('cid'),
        el: getProp('el'),
        viewName: getProp('name')
      };
      var data = {
        payload: payload,
        channel: channel,
        srcElement: srcElement
      };
      return new _channels_channels_payload__WEBPACK_IMPORTED_MODULE_0__["ChannelsPayload"](channelName, new Rx.Observable.of(''), data, 'subscribe');
    },
    sendLifeStreamPayload: function sendLifeStreamPayload(obs, data) {
      return new _channels_channels_payload__WEBPACK_IMPORTED_MODULE_0__["ChannelsPayload"]('LIFESTREAM', obs, data, 'subscribe');
    },
    createLifeStreamPayload: function createLifeStreamPayload(STEP, data, type) {
      if (data === void 0) {
        data = {};
      }

      if (type === void 0) {
        type = 'parent';
      }

      var viewId = this.props.name + ": " + this.props.cid;
      return new _channels_lifestream_payload__WEBPACK_IMPORTED_MODULE_1__["LifestreamPayload"]('LIFESTREAM', STEP, type, viewId, data).data;
    }
  };
}

/***/ }),

/***/ "./src/spyne/utils/viewstream-animations.js":
/*!**************************************************!*\
  !*** ./src/spyne/utils/viewstream-animations.js ***!
  \**************************************************/
/*! exports provided: fadein, fadeout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fadein", function() { return fadein; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fadeout", function() { return fadeout; });
var createFaderInlineText = function createFaderInlineText(isInBool, t, e, startZeroBool) {
  if (isInBool === void 0) {
    isInBool = false;
  }

  if (t === void 0) {
    t = 1;
  }

  if (e === void 0) {
    e = 'ease';
  }

  if (startZeroBool === void 0) {
    startZeroBool = false;
  }

  var initOpacityZero = startZeroBool === true ? 'opacity:0;' : '';
  var opacity = isInBool === true ? 1 : 0;
  return initOpacityZero + "transition: opacity " + t + "s " + e + "; opacity: " + opacity + ";";
};

function fadein(el, t) {
  var currentOpacity = window.getComputedStyle(el).opacity * 1;
  var startAtZero = currentOpacity === 1;
  var inlineCss = createFaderInlineText(true, t, 'ease', startAtZero);
  el.style.cssText += inlineCss;
}
function fadeout(el, t, callback) {
  var inlineCss = createFaderInlineText(false, t, 'ease');
  el.style.cssText += inlineCss;
  console.log(t, ' inline is ', inlineCss); // window.setTimeout(callback, t * 1000);

  el.addEventListener('transitionend', callback, false);
}

/***/ }),

/***/ "./src/spyne/utils/viewstream-lifecycle-observables.js":
/*!*************************************************************!*\
  !*** ./src/spyne/utils/viewstream-lifecycle-observables.js ***!
  \*************************************************************/
/*! exports provided: LifecyleObservables */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LifecyleObservables", function() { return LifecyleObservables; });
var Rx = __webpack_require__(/*! rxjs */ "rxjs");

var R = __webpack_require__(/*! ramda */ "ramda");

class LifecyleObservables {
  constructor(props) {
    this.props.observableStreams = LifecyleObservables.createDirectionalObservables();
  }

  static createDirectionalFiltersObject() {
    var dirInternal = 'internal';
    var dirParent = 'parent';
    var dirChild = 'child';
    return {
      P: [dirParent],
      C: [dirChild],
      PCI: [dirParent, dirInternal, dirChild],
      CI: [dirChild, dirInternal],
      PI: [dirParent, dirInternal],
      PC: [dirParent, dirChild]
    };
  }

  static addDefaultDir(obj) {
    var defaults = R.flip(R.merge);
    return defaults({
      $dir: ['internal']
    }, R.clone(obj));
  }

  static addDownInternalDir(obj, arr) {
    if (arr === void 0) {
      arr = ['internal', 'down'];
    }

    var defaults = R.flip(R.merge);
    return defaults(R.clone(obj), {
      $dir: arr
    });
  }

  static addChildAndInternalDir(obj, arr) {
    if (arr === void 0) {
      arr = ['child', 'down'];
    }

    var defaults = R.flip(R.merge);
    return defaults(R.clone(obj), {
      $dir: arr
    });
  }

  static mapToDefaultDir(p) {
    return this.addDefaultDir(p);
  }

  static createDirectionalObservables(obs$, viewName, cid) {
    if (obs$ === void 0) {
      obs$ = new Rx.Subject();
    }

    if (viewName !== undefined && cid !== undefined) {
      obs$['viewName'] = viewName;
      obs$['cid'] = cid;
    }

    var filterStreams = function filterStreams(val) {
      return R.propSatisfies(function (arrType) {
        return arrType.includes(val);
      }, '$dir');
    };

    var filterParent = filterStreams('parent');
    var filterChild = filterStreams('child');
    var filterInternal = filterStreams('internal');

    var addfrom$ = function addfrom$(relStr) {
      return R.merge({
        from$: relStr
      });
    };

    var addParentfrom$ = addfrom$('child');
    var addInternalfrom$ = addfrom$('internal');
    var addChildfrom$ = addfrom$('parent');
    var raw$ = obs$.filter(function (payload) {
      return payload !== undefined && payload.action !== undefined;
    }); // .filter(p => p.$dir !== undefined)
    // .do(p => console.log('payload : ', p.$dir, p));

    var toInternal$ = obs$.filter(filterInternal).map(addInternalfrom$);
    var toParent$ = obs$.filter(filterParent).map(addParentfrom$);
    var toChild$ = obs$.filter(filterChild).map(addChildfrom$); // const upObs$ = obs$.do(p => console.log('UP: ', p));

    var streamObj = {
      parent: toParent$,
      internal: toInternal$,
      child: toChild$
    };

    var completeStream = function completeStream(arr) {
      if (arr === void 0) {
        arr = [];
      }

      var endStream = function endStream(o) {
        o.complete();
        o.isStopped = true;
      };

      var setCompleteStream = function setCompleteStream(str) {
        if (streamObj[str] !== undefined) {
          var _obs$ = streamObj[str];
          endStream(_obs$);
        }
      };

      if (arr !== undefined && arr.length >= 1) {
        arr.forEach(setCompleteStream);
      }
    };

    var completeAll = function completeAll() {
      var completeStream = function completeStream(o) {
        o.complete();
        o.isStopped = true;
      };

      R.forEach(completeStream, [raw$, toInternal$, toParent$, toChild$]);
    };

    return {
      raw$: raw$,
      toInternal$: toInternal$,
      toParent$: toParent$,
      toChild$: toChild$,
      completeAll: completeAll,
      completeStream: completeStream
    };
  }

}

/***/ }),

/***/ "./src/spyne/views/dom-item-selectors.js":
/*!***********************************************!*\
  !*** ./src/spyne/views/dom-item-selectors.js ***!
  \***********************************************/
/*! exports provided: DomItemSelectors */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomItemSelectors", function() { return DomItemSelectors; });
var R = __webpack_require__(/*! ramda */ "ramda"); // const Rx = require('rxjs');


class DomItemSelectors {
  constructor(cxt, str) {
    this.el = str !== undefined ? cxt.querySelectorAll(str) : cxt;
    this.queryStr = str;

    if (this.el.length === 1) {
      this.el = R.head(this.el);
    } else if (this.el.constructor.name === 'NodeList') {
      this.el = DomItemSelectors.createArrayFromNodeList(this.el);
    }

    this.cList = this.el.classList;
    this.elProps = new Map();
    this.createMethods();
  }

  static createArrayFromNodeList(nList) {
    var reducer = function reducer(acc, item) {
      acc.push(item);
      return acc;
    };

    return R.reduce(reducer, [], nList);
  }

  createMethods() {
    var mapAddClass = function mapAddClass(item, s) {
      return item.classList.add(s);
    };

    var mapRemoveClass = function mapRemoveClass(item, s) {
      return item.classList.remove(s);
    };

    var mapSetClass = function mapSetClass(item, s) {
      item.classList.value = s;
      return item;
    };

    var mapInlineCss = function mapInlineCss(item, s) {
      item.style.cssText = s;
      return item;
    };

    var mapToggleClass = function mapToggleClass(item, s, bool) {
      if (bool === void 0) {
        bool = true;
      }

      item.classList.toggle(s, bool);
      return item;
    };

    this.addClass = this.mapToValue(mapAddClass);
    this.removeClass = this.mapToValue(mapRemoveClass);
    this.setClass = this.mapToValue(mapSetClass);
    this.inlineCss = this.mapToValue(mapInlineCss);
    this.toggleClass = this.mapToValue(mapToggleClass);
  }

  mapMethod(fn) {
    var _this = this;

    // Add a function to the class that will wait for a string param
    return function (str) {
      _this.elArr.map(fn);

      return _this;
    };
  }

  addAnimClass(str) {
    var _this2 = this;

    var adder = function adder() {
      return _this2.addClass(str);
    };

    requestAnimationFrame(function () {
      setTimeout(adder, 0);
    });
    return this;
  }

  mapToValue(f) {
    var _this3 = this;

    return function (str) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      // console.log('str f this', str, f, this);
      _this3.elArr.map(function (item) {
        return f.apply(void 0, [item, str].concat(args));
      });

      return _this3;
    };
  }

  setClassOnBool(str, bool) {
    if (str === void 0) {
      str = '';
    }

    if (bool === void 0) {
      bool = true;
    }

    if (bool) {
      this.addClass(str);
    } else {
      this.removeClass(str);
    }

    return this;
  }

  setActiveItem(query, str) {
    var activeEl = document.querySelector(this.queryStr + query);

    var filterForActive = function filterForActive(item) {
      return item === activeEl;
    }; // const onActive = bool => bool === true ? item.addClass(str) : item.removeClass(str);


    var adder = function adder(item) {
      item.classList.add(str);
    };

    var remover = function remover(item) {
      item.classList.remove(str);
    };

    var mapTheActive = R.ifElse(filterForActive, adder, remover);
    this.elArr.map(mapTheActive);
  }

  query(str) {
    var elementExists = this.el.querySelector(str); //console.log('query is ',this.el,str, elementExists);

    if (elementExists !== null) {
      return new DomItemSelectors(this.el, str);
    } else {
      var id = this.el.getAttribute('id');
      console.warn("Spyne Warning: the element, \"" + str + "\" does not exist in this element, \"" + id + "\"!");
    }
  }

  getEl() {
    return this.el;
  }

  get elArr() {
    if (this.el.constructor.name === 'NodeList') {
      return DomItemSelectors.createArrayFromNodeList(this.el);
    } else {
      return [].concat(this.el);
    }
  }
  /*
    getBoxEl() {
      console.log('getbox el ',this.el);
      return [].concat(this.el);
    }
  */


  unmount() {
    this.el = undefined;
    this.cList = undefined;
    this.inline = undefined;
  }

}

/***/ }),

/***/ "./src/spyne/views/dom-item.js":
/*!*************************************!*\
  !*** ./src/spyne/views/dom-item.js ***!
  \*************************************/
/*! exports provided: DomItem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomItem", function() { return DomItem; });
/* harmony import */ var _utils_mixins_base_core_mixins__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/mixins/base-core-mixins */ "./src/spyne/utils/mixins/base-core-mixins.js");
/* harmony import */ var _dom_template_renderer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dom-template-renderer */ "./src/spyne/views/dom-template-renderer.js");
/* harmony import */ var _utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/deep-merge */ "./src/spyne/utils/deep-merge.js");
// import {createElement} from '../utils/dom-methods';


 // import {DomTemplateRenderer} from './template-renderer';

var R = __webpack_require__(/*! ramda */ "ramda");

class DomItem {
  /**
   * @module DomItem
   *
   * @desc
   * This class is mostly used internally by the ViewStream object, but it can be also used to generate a lightweight dom element that contains no props or parameters.
   *
   * @constructor
   * @param {string} tagName the tagname for this dom element.
   * @param {object} attributes any domElement attribute (except for class )
   * @param {string|object} content string for text tags and json for templates
   * @param {template} template
   */
  constructor(tagName, attributes, content, template) {
    if (tagName === void 0) {
      tagName = 'div';
    }

    if (attributes === void 0) {
      attributes = {};
    }

    if (content === void 0) {
      content = undefined;
    }

    if (template === void 0) {
      template = undefined;
    }

    var isSimpleView = R.is(String, attributes);

    if (isSimpleView === true) {
      content = attributes;
      attributes = {};
    }

    this.props = new Map();
    this.setProp('fragment', document.createDocumentFragment());
    this.setProp('tagName', tagName);
    this.setProp('attrs', this.updateAttrs(attributes));
    this.setProp('content', content);
    this.setProp('template', template);
    this.addMixins();
  }

  setProp(key, val) {
    this.props.set(key, val);
  }

  getProp(val) {
    return this.props.get(val);
  }

  get el() {
    return this.props.get('el');
  }

  setElAttrs(el, params) {
    var addAttributes = function addAttributes(val, key) {
      var addToDataset = function addToDataset(val, key) {
        el.dataset[key] = val;
      };

      if (key === 'dataset') {
        R.forEachObjIndexed(addToDataset, val);
      } else {
        el.setAttribute(key, val);
      }
    };

    this.getProp('attrs').forEach(addAttributes);
    return el;
  }

  updateAttrs(params, m) {
    var theMap = m !== undefined ? m : new Map();

    var addAttributes = function addAttributes(val, key) {
      return theMap.set(key, val);
    };

    R.mapObjIndexed(addAttributes, params);
    return theMap;
  }

  addTemplate(el) {
    var _this = this;

    var template = this.getProp('template');

    var addTmpl = function addTmpl(template) {
      var data = _this.getProp('content');

      data = R.is(Object, data) ? data : {};
      var frag = new _dom_template_renderer__WEBPACK_IMPORTED_MODULE_1__["DomTemplateRenderer"](template, data).getTemplateNode();
      el.appendChild(frag);
      return el;
    };

    var doNothing = function doNothing(el) {
      return el;
    };

    return template !== undefined ? addTmpl(template) : doNothing(el);
  }

  createElement(tagName) {
    if (tagName === void 0) {
      tagName = 'div';
    }

    return document.createElement(tagName);
  }

  addContent(el) {
    var text = this.getProp('content');
    var isText = R.is(String, text);

    if (isText === true) {
      var txt = document.createTextNode(text);
      el.appendChild(txt);
    }

    return el;
  }

  execute() {
    var el = R.pipe(this.createElement.bind(this), this.setElAttrs.bind(this), this.addTemplate.bind(this), this.addContent.bind(this))(this.getProp('tagName')); // this.getProp('fragment').appendChild(el);

    this.props.set('el', el);
  }

  render() {
    this.execute();
    return this.getProp('el');
  }

  returnIfDefined(obj, val) {
    if (val !== undefined) {
      var isObj = typeof val === 'undefined';
      isObj === false ? obj[val] = val : obj[val] = Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__["deepMerge"])(obj[va], val); // Object.assign(obj[val], val);
    }
  }

  updateprops(val) {
    this.returnIfDefined(this.props, val);
    return this;
  }

  updatepropsAndRun(val) {
    this.updateprops(val);
    this.execute();
    return this.getProp('fragment');
  }

  unmount() {
    if (this.props !== undefined) {
      // console.log('dom item unmounting ', this, this.props);
      this.getProp('el').remove();
      this.props.clear();
      this.gc();
    }
  }

  updateTag(tagName) {
    if (tagName === void 0) {
      tagName = 'div';
    }

    this.updateprops(tagName);
  }

  updateAttributes(attrs) {
    if (attrs === void 0) {
      attrs = {};
    }

    this.updateprops(attrs);
  }

  updateTemplate(template) {
    this.updateprops(template);
  }

  updateData(data) {
    if (data === void 0) {
      data = {};
    }

    this.updateprops(data);
  }

  addTagAndRender(tagName) {
    if (tagName === void 0) {
      tagName = 'div';
    }

    this.updatepropsAndRun(tagName);
  }

  addAttrsibutesAndRender(attrs) {
    if (attrs === void 0) {
      attrs = {};
    }

    this.updatepropsAndRun(attrs);
  }

  addTemplateAndRender(template) {
    this.updatepropsAndRun(template);
  }

  addDataAndRender(data) {
    if (data === void 0) {
      data = {};
    }

    this.updatepropsAndRun(data);
  } //  ==================================
  // BASE CORE MIXINS
  //  ==================================


  addMixins() {
    var coreMixins = Object(_utils_mixins_base_core_mixins__WEBPACK_IMPORTED_MODULE_0__["baseCoreMixins"])();
    this.gc = coreMixins.gc.bind(this);
  }

}

/***/ }),

/***/ "./src/spyne/views/dom-template-renderer.js":
/*!**************************************************!*\
  !*** ./src/spyne/views/dom-template-renderer.js ***!
  \**************************************************/
/*! exports provided: DomTemplateRenderer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomTemplateRenderer", function() { return DomTemplateRenderer; });
var R = __webpack_require__(/*! ramda */ "ramda");

class DomTemplateRenderer {
  constructor(template, data) {
    var _this = this;

    this.template = this.formatTemplate(template);
    this.templateData = data;
    var strArr = DomTemplateRenderer.getStringArray(this.template);
    var strMatches = this.template.match(DomTemplateRenderer.findTmplLoopsRE());
    strMatches = strMatches === null ? [] : strMatches;

    var mapTmplLoop = function mapTmplLoop(str, data) {
      return str.replace(DomTemplateRenderer.parseTmplLoopsRE(), _this.parseTheTmplLoop.bind(_this));
    };

    var findTmplLoopsPred = R.contains(R.__, strMatches);
    var checkForMatches = R.ifElse(findTmplLoopsPred, mapTmplLoop, this.addParams.bind(this));
    this.finalArr = strArr.map(checkForMatches);
  }

  static getStringArray(template) {
    var strArr = template.split(DomTemplateRenderer.findTmplLoopsRE());
    var emptyRE = /^([\\n\s\W]+)$/;

    var filterOutEmptyStrings = function filterOutEmptyStrings(s) {
      return s.match(emptyRE);
    };

    return R.reject(filterOutEmptyStrings, strArr);
  }

  static findTmplLoopsRE() {
    return /({{#\w+}}[\w\n\s\W]+?{{\/\w+}})/gm;
  }

  static parseTmplLoopsRE() {
    return /({{#(\w+)}})([\w\n\s\W]+?)({{\/\2}})/gm;
  }

  static swapParamsForTagsRE() {
    return /({{)(.*?)(}})/gm;
  }

  removeThis() {
    this.finalArr = undefined;
    this.templateData = undefined;
    this.template = undefined;
  }

  getTemplateNode() {
    var html = this.finalArr.join(' ');
    var el = document.createRange().createContextualFragment(html);
    window.setTimeout(this.removeThis(), 10);
    return el;
  }

  getTemplateString() {
    return this.finalArr.join(' ');
  }

  formatTemplate(template) {
    return typeof template === 'string' ? template : template.text;
  }

  addParams(str) {
    var _this2 = this;

    var replaceTags = function replaceTags(str, p1, p2, p3) {
      var dataVal = _this2.templateData[p2];
      var defaultIsEmptyStr = R.defaultTo('');
      return defaultIsEmptyStr(dataVal);
    };

    return str.replace(DomTemplateRenderer.swapParamsForTagsRE(), replaceTags);
  }

  parseTheTmplLoop(str, p1, p2, p3) {
    var subStr = p3;
    var elData = this.templateData[p2];

    var parseString = function parseString(item, str) {
      return str.replace(DomTemplateRenderer.swapParamsForTagsRE(), item);
    };

    var parseObject = function parseObject(obj, str) {
      var loopObj = function loopObj(str, p1, p2) {
        return obj[p2];
      };

      return str.replace(DomTemplateRenderer.swapParamsForTagsRE(), loopObj);
    };

    var mapStringData = function mapStringData(d) {
      if (typeof d === 'string') {
        d = parseString(d, subStr);
      } else {
        d = parseObject(d, subStr);
      }

      return d;
    };

    return elData.map(mapStringData).join(' ');
  }

}

/***/ }),

/***/ "./src/spyne/views/view-stream-broadcaster.js":
/*!****************************************************!*\
  !*** ./src/spyne/views/view-stream-broadcaster.js ***!
  \****************************************************/
/*! exports provided: ViewStreamBroadcaster */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewStreamBroadcaster", function() { return ViewStreamBroadcaster; });
/* harmony import */ var _utils_mixins_base_streams_mixins__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/mixins/base-streams-mixins */ "./src/spyne/utils/mixins/base-streams-mixins.js");
/* harmony import */ var _utils_frp_tools__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/frp-tools */ "./src/spyne/utils/frp-tools.js");



var Rx = __webpack_require__(/*! rxjs */ "rxjs");

var R = __webpack_require__(/*! ramda */ "ramda");

class ViewStreamBroadcaster {
  constructor(props, broadcastFn) {
    this.addMixins();
    this.props = props;
    this.broadcastFn = broadcastFn;
    this.broadcaster(this.broadcastFn);
  }

  addDblClickEvt(q) {
    var dblclick$ = Rx.Observable.fromEvent(q, 'click'); // console.log('ADDING DBL CLICK ', q);

    var stream$ = dblclick$.buffer(dblclick$.debounceTime(250)).filter(function (p) {
      return p.length === 2;
    }).map(function (p) {
      var data = R.clone(p[0]); // ADD DOUBLECLICK TO UI EVENTS

      data['typeOverRide'] = 'dblclick';
      return data;
    });
    return stream$;
  } //  ==================================================================
  // BROADCAST BUTTON EVENTS
  //  ==================================================================


  broadcast(args) {
    var _this = this;

    // payloads to send, based on either the array or the elements dataMap
    var channelPayloads = {
      'UI': this.sendUIPayload,
      'ROUTE': this.sendRoutePayload
    }; // spread operator to select variables from arrays

    var selector = args[0],
        event = args[1],
        local = args[2]; //console.log('args is ',args);
    // btn query
    // let query = this.props.el.querySelectorAll(selector);

    var channel; // hoist channel and later check if chnl exists

    var query = this.props.el.querySelectorAll(selector);
    var isLocalEvent = local !== undefined;

    var addObservable = function addObservable(q) {
      // the  btn observable
      var observable = event !== 'dblClick' ? Rx.Observable.fromEvent(q, event) : _this.addDblClickEvt(q); // select channel and data values from either the array or the element's dom Map

      channel = q.dataset.channel; //ifNilThenUpdate(chnl, q.dataset.channel);

      var data = {}; // convertDomStringMapToObj(q.dataset);

      data['payload'] = Object(_utils_frp_tools__WEBPACK_IMPORTED_MODULE_1__["convertDomStringMapToObj"])(q.dataset);
      data.payload = R.omit(['channel'], data.payload);
      data['channel'] = channel; // payload needs cid# to pass verification
      // data['event'] = event;
      // data['el'] = q;

      data['srcElement'] = {}; // R.pick(['cid','viewName'], data);

      data.srcElement['cid'] = _this.props.id;
      data.srcElement['isLocalEvent'] = isLocalEvent;
      data.srcElement['viewName'] = _this.props.name;
      data.srcElement['event'] = event;
      data.srcElement['el'] = q; // select the correct payload

      var channelPayload = channel !== undefined ? channelPayloads[channel] : channelPayloads['UI']; // run payload

      channelPayload(observable, data);
    };

    if (query === undefined || query.length <= 0) {
      console.warn("Spyne Warning: The item " + selector + ", does not appear to exist!"); //query = this.props.el;
      // addObservable(query, event);
    } else {
      query.forEach = Array.prototype.forEach;
      query.forEach(addObservable);
    }
  }

  broadcaster(arrFn) {
    var _this2 = this;

    var broadcastArr = arrFn();
    broadcastArr.forEach(function (args) {
      return _this2.broadcast(args);
    });
  } //  =================================================================


  addMixins() {
    //  ==================================
    // BASE STREAM MIXINS
    //  ==================================
    var streamMixins = Object(_utils_mixins_base_streams_mixins__WEBPACK_IMPORTED_MODULE_0__["baseStreamsMixins"])();
    this.sendUIPayload = streamMixins.sendUIPayload;
    this.sendRoutePayload = streamMixins.sendRoutePayload;
    this.createLifeStreamPayload = streamMixins.createLifeStreamPayload;
  }

}

/***/ }),

/***/ "./src/spyne/views/view-stream-enhancer-loader.js":
/*!********************************************************!*\
  !*** ./src/spyne/views/view-stream-enhancer-loader.js ***!
  \********************************************************/
/*! exports provided: ViewStreamEnhancerLoader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewStreamEnhancerLoader", function() { return ViewStreamEnhancerLoader; });
/* harmony import */ var _utils_frp_tools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/frp-tools */ "./src/spyne/utils/frp-tools.js");


var R = __webpack_require__(/*! ramda */ "ramda");

class ViewStreamEnhancerLoader {
  constructor(parent, enhancersArr) {
    this.context = parent;
    this.enhancersMap = new Map();
    this.enhancersArr = enhancersArr;
    this.initMap();
    this.addAllEnhancerMethods();
  }

  initMap() {
    this.enhancersMap.set('ALL', []);
    var allMethodsArr = Object(_utils_frp_tools__WEBPACK_IMPORTED_MODULE_0__["getAllMethodNames"])(this.context).allMethods;
    this.updateMap('LOCAL', allMethodsArr);
  }

  getEnhancersMap() {
    return this.enhancersMap;
  }

  updateMap(name, arr) {
    var allArr = R.concat(this.enhancersMap.get('ALL'), arr);
    this.enhancersMap.set(name, arr);
    this.enhancersMap.set('ALL', allArr);
  }

  getMethodsArr(str) {
    return this.enhancersMap.get(str);
  }

  createEnhancerMethodsObj(EnhancerClass) {
    var _this = this;

    var sendError = function sendError(str) {
      return console.error("Spyne Error: The following enhancer method, \"" + str + "\", already exists and cannot be added to the " + enhancer.name + " Enhancer!");
    };

    var enhancer = new EnhancerClass(this.context);

    var validateMethods = function validateMethods(arr) {
      var methodsExistsFilter = R.contains(R.__, _this.getMethodsArr('ALL'));
      var dupedMethods = R.filter(methodsExistsFilter, arr);
      dupedMethods.forEach(sendError);
      return dupedMethods;
    };

    var enhancerMethodsObj = enhancer.getEnhancerMethods();
    var dupedMethodsArr = validateMethods(enhancerMethodsObj.allMethods);
    var dropDupedMethodsFromArr = R.dropWhile(R.contains(R.__, dupedMethodsArr));
    enhancerMethodsObj = R.map(dropDupedMethodsFromArr, enhancerMethodsObj);
    this.updateMap(enhancer.name, enhancerMethodsObj.allMethods);
    enhancerMethodsObj['enhancer'] = enhancer;
    enhancerMethodsObj['name'] = enhancer.name;
    return enhancerMethodsObj;
  }

  addAllEnhancerMethods() {
    var _this2 = this;

    var addEnhancerMethods = function addEnhancerMethods(enhancerClass) {
      var enhancerMethodsObj = _this2.createEnhancerMethodsObj(enhancerClass);

      var enhancer = enhancerMethodsObj.enhancer;
      enhancer.bindParentViewStream(enhancerMethodsObj, _this2.context);
    };

    R.forEach(addEnhancerMethods, this.enhancersArr);
  }

}

/***/ }),

/***/ "./src/spyne/views/view-stream-enhancer.js":
/*!*************************************************!*\
  !*** ./src/spyne/views/view-stream-enhancer.js ***!
  \*************************************************/
/*! exports provided: ViewStreamEnhancer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewStreamEnhancer", function() { return ViewStreamEnhancer; });
/* harmony import */ var _utils_frp_tools__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/frp-tools */ "./src/spyne/utils/frp-tools.js");


var R = __webpack_require__(/*! ramda */ "ramda");

class ViewStreamEnhancer {
  constructor(parentViewStream) {
    this.parentViewStream = parentViewStream;
    this.omittedMethods = ['autoBinder', 'initAutoBinder', 'getEnhancerMethods', 'bindParentViewStream'];
  }

  initAutoBinder() {
    this.autoBinder();
  }

  getEnhancerMethods() {
    return Object(_utils_frp_tools__WEBPACK_IMPORTED_MODULE_0__["getAllMethodNames"])(this, this.omittedMethods);
  }

  bindParentViewStream(methodsObj, context) {
    var _this = this;

    var bindMethodsToParentViewStream = function bindMethodsToParentViewStream(str, isStatic) {
      if (isStatic === void 0) {
        isStatic = false;
      }

      var addMethod = function addMethod(s) {
        context[s] = constructorType[s].bind(context);
      };

      var constructorType = isStatic === true ? _this.constructor : _this;
      var propertyType = typeof constructorType[str];

      if (propertyType === 'function') {
        addMethod(str);
      }
    };

    var bindCurry = R.curryN(2, bindMethodsToParentViewStream);
    var bindStaticMethodsToParentViewStream = bindCurry(R.__, true);
    R.forEach(bindStaticMethodsToParentViewStream, methodsObj.staticMethods);
    R.forEach(bindMethodsToParentViewStream, methodsObj.methods);
  }

  autoBinder() {
    var allMethods = this.getEnhancerMethods(); // console.log('all ',allMethods);

    this.bindParentViewStream(allMethods, this.parentViewStream);
  }

}

/***/ }),

/***/ "./src/spyne/views/view-stream.js":
/*!****************************************!*\
  !*** ./src/spyne/views/view-stream.js ***!
  \****************************************/
/*! exports provided: ViewStream */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewStream", function() { return ViewStream; });
/* harmony import */ var _utils_mixins_base_core_mixins__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/mixins/base-core-mixins */ "./src/spyne/utils/mixins/base-core-mixins.js");
/* harmony import */ var _utils_mixins_base_streams_mixins__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/mixins/base-streams-mixins */ "./src/spyne/utils/mixins/base-streams-mixins.js");
/* harmony import */ var _utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/deep-merge */ "./src/spyne/utils/deep-merge.js");
/* harmony import */ var _utils_frp_tools__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/frp-tools */ "./src/spyne/utils/frp-tools.js");
/* harmony import */ var _view_to_dom_mediator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./view-to-dom-mediator */ "./src/spyne/views/view-to-dom-mediator.js");
/* harmony import */ var _view_stream_enhancer_loader__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./view-stream-enhancer-loader */ "./src/spyne/views/view-stream-enhancer-loader.js");
/* harmony import */ var _channels_channels_config__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../channels/channels-config */ "./src/spyne/channels/channels-config.js");
/* harmony import */ var _view_stream_broadcaster__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./view-stream-broadcaster */ "./src/spyne/views/view-stream-broadcaster.js");
/* harmony import */ var _channels_channels_payload__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../channels/channels-payload */ "./src/spyne/channels/channels-payload.js");
/* harmony import */ var _utils_viewstream_lifecycle_observables__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../utils/viewstream-lifecycle-observables */ "./src/spyne/utils/viewstream-lifecycle-observables.js");
/* harmony import */ var _dom_item_selectors__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./dom-item-selectors */ "./src/spyne/views/dom-item-selectors.js");



 // import {gc} from '../utils/gc';









var Rx = __webpack_require__(/*! rxjs */ "rxjs");

var R = __webpack_require__(/*! ramda */ "ramda");

class ViewStream {
  /**
   * @module ViewStream
   *
   * @desc
   * The ViewStream object creates or references  a dom elment; the dom element can be as simple as a &#60;p&gt; tag, or the dom element can be a large dom chunk that is generated from data and an html template.
   * <br><br>
   * Generally, the idea is to extend the ViewStream class and add the custom values within the constructor function, but all of the values can be passed as parameters as well.
   *
   * @example
   * // returns <h2>Hello World</h2>
   * new ViewStream({tagName:'h2', data:'Hello World'};
   * @example
   * //  returns
   * <ul>
   *    <li>firstName: Jane<li>
   *    <li>lastName: Doe<li>
   *    <li>Age: 23<li>
   * </ul>
   *
   * let myTemplate = '<li>firstName: {{fName}}<li>lastName: {{lName}}<li>Age: {{age}}';
   * let myData = {fName: Jane, lName: Doe, age:23};
   * new ViewStream({tagName:'ul', data:myData, template:myTemplate});
   *
   *
   *
   * @constructor
   * @param {object} props This json object takes in parameters to generate or reference the dom element
   * @property {string} props.tagName  - 'div'  This can be any dom tag
   * @property {domItem} props.el undefined, if defined, ViewStream will connect to that element
   * @property {string|object} props.data undefined, // string for innerText or Json object for html template
   * @property {boolean} props.animateIn - false, animates in View
   * @property {number} props.animateInTime - .5
   * @property {boolean} props.animateOut false, animates in View
   * @property {number} props.animateOutTime .5
   * @property {string} props.id - undefined, generates a random id if left undefined
   * @property {boolean} props.debug false
   * @property {template} props.template undefined, // html template
   *
   */
  constructor(props) {
    var _this = this;

    if (props === void 0) {
      props = {};
    }

    this.checker = Math.random();
    this.addMixins();

    this.defaults = function () {
      var cid = _this.createId();

      var id = props.id ? props.id : cid;
      return {
        cid: cid,
        id: id,
        tagName: 'div',
        el: undefined,
        data: undefined,
        animateIn: false,
        animateInTime: 0.5,
        animateOut: false,
        animateOutTime: 0.5,
        hashId: "#" + id,
        viewClass: _view_to_dom_mediator__WEBPACK_IMPORTED_MODULE_4__["ViewToDomMediator"],
        extendedSourcesHashMethods: {},
        debug: false,
        template: undefined,
        node: document.createDocumentFragment(),
        name: Object(_utils_frp_tools__WEBPACK_IMPORTED_MODULE_3__["getConstructorName"])(_this)
      };
    };

    this._state = {};
    this.$dirs = _utils_viewstream_lifecycle_observables__WEBPACK_IMPORTED_MODULE_9__["LifecyleObservables"].createDirectionalFiltersObject();
    this.addDefaultDirection = _utils_viewstream_lifecycle_observables__WEBPACK_IMPORTED_MODULE_9__["LifecyleObservables"].addDefaultDir;
    this.addDownInternalDir = _utils_viewstream_lifecycle_observables__WEBPACK_IMPORTED_MODULE_9__["LifecyleObservables"].addDownInternalDir; //this.props = Object.assign({}, this.defaults(), props);

    this.props = Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__["deepMerge"])(this.defaults(), props); //window.Spyne['config'] = deepMerge(defaultConfig, config);// Object.assign({}, defaultConfig, config);// config !== undefined ? config : defaultConfig;

    this.props['domAttributes'] = R.pick(['id', 'class', 'dataset'], this.props);
    this.loadEnhancers();
    this.loadAllMethods();
    this.props.action = 'LOADED';
    this.sink$ = new Rx.Subject();
    var ViewClass = this.props.viewClass;
    this.view = new ViewClass(this.sink$, {}, this.props.cid, this.constructor.name); // new this.props.viewClass(this.sink$);

    this.sourceStreams = this.view.sourceStreams;
    this._rawSource$ = this.view.getSourceStream();
    this._rawSource$['viewName'] = this.props.name;
    this.sendEventsDownStream = this.sendEventsDownStreamFn;
    this.init();
    this.checkIfElementAlreadyExists();
  }

  checkIfElementAlreadyExists() {
    var elIsDomElement = function elIsDomElement(el) {
      return el !== undefined && el.tagName !== undefined;
    };

    var elIsRendered = function elIsRendered(el) {
      return document.body.contains(el);
    };

    var elIsReadyBool = R.propSatisfies(R.allPass([elIsRendered, elIsDomElement]), 'el');

    if (elIsReadyBool(this.props)) {
      this.postRender();
    }
  }

  loadEnhancers(arr) {
    if (arr === void 0) {
      arr = [];
    }

    var enhancerLoader = new _view_stream_enhancer_loader__WEBPACK_IMPORTED_MODULE_5__["ViewStreamEnhancerLoader"](this, arr);
    this.props['enhancersMap'] = enhancerLoader.getEnhancersMap();
    enhancerLoader = undefined;
  }

  loadAllMethods() {
    var _this2 = this;

    var channelFn = R.curry(this.onChannelMethodCall.bind(this));

    var createExtraStatesMethod = function createExtraStatesMethod(arr) {
      var action = arr[0],
          funcStr = arr[1],
          enhancer = arr[2];
      var defaultEnhancer = R.defaultTo('LOCAL');
      _this2.props.extendedSourcesHashMethods[action] = channelFn(funcStr, defaultEnhancer(enhancer));
    };

    this.addActionListeners().forEach(createExtraStatesMethod);
    this.props.hashSourceMethods = this.setSourceHashMethods(this.props.extendedSourcesHashMethods);
  }

  addActionListeners() {
    return [];
  }

  onChannelMethodCall(str, enhancer, p) {
    if (p.$dir !== undefined && p.$dir.includes('child') && this.deleted !== true) {
      var obj = Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__["deepMerge"])({}, p); // Object.assign({}, p);

      obj['$dir'] = this.$dirs.C;
      this.sourceStreams.raw$.next(obj);
    }

    var methodsArr = this.props.enhancersMap.get(enhancer);

    if (R.contains(str, methodsArr) === false) {
      console.warn("Spyne Warning: The method, \"" + str + "\", does not appear to exist in " + enhancer + " file! ");
    } else {
      this[str](p);
    }
  }

  setSourceHashMethods(extendedSourcesHashMethods) {
    var _this3 = this;

    if (extendedSourcesHashMethods === void 0) {
      extendedSourcesHashMethods = {};
    }

    var hashSourceKeys = {
      'DISPOSING': function DISPOSING(p) {
        return _this3.checkParentDispose(p);
      },
      'DISPOSE': function DISPOSE(p) {
        return _this3.onDispose(p);
      },
      // 'CHILD_DISPOSE'                    : (p) => this.onDispose(p),
      'RENDERED': function RENDERED(p) {
        return _this3.onRendered(p);
      },
      'RENDERED_AND_ATTACHED_TO_DOM': function RENDERED_AND_ATTACHED_TO_DOM(p) {
        return _this3.onRendered(p);
      },
      'RENDERED_AND_ATTACHED_TO_PARENT': function RENDERED_AND_ATTACHED_TO_PARENT(p) {
        return _this3.onRendered(p);
      },
      // 'CHILD_RENDERED'                   : (p) => this.attachChildToView(p),
      'READY_FOR_GC': function READY_FOR_GC(p) {
        return _this3.onReadyToGC(p);
      },
      'NOTHING': function NOTHING() {
        return {};
      }
    };
    return _utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__["deepMerge"].all([{}, hashSourceKeys, extendedSourcesHashMethods]);
  } //  =====================================================================
  // ====================== MAIN STREAM METHODS ==========================


  init() {
    var _this4 = this;

    this._source$ = this._rawSource$.map(function (payload) {
      return _this4.onMapViewSource(payload);
    }).takeWhile(this.notGCSTATE);
    this.initAutoMergeSourceStreams();
    this.updateSourceSubscription(this._source$, true);
  }

  notGCSTATE(p) {
    return !p.action.includes('READY_FOR_GC');
  }

  eqGCSTATE(p) {
    return !p.action.includes('READY_FOR_GC');
  }

  notCOMPLETED(p) {
    return !p.action.includes('COMPLETED');
  }

  notGCCOMPLETE(p) {
    return !p.action.includes('GC_COMPLETE');
  }

  testVal(p) {
    console.log('TESTING VALL IS ', p);
  }

  addParentStream(obs, attachData) {
    var _this5 = this;

    var filterOutNullData = function filterOutNullData(data) {
      return data !== undefined && data.action !== undefined;
    };

    var checkIfDisposeOrFadeout = function checkIfDisposeOrFadeout(d) {
      var data = Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__["deepMerge"])({}, d);

      if (data.action === 'DISPOSE_AND_READY_FOR_GC') {
        _this5.onDispose(data);

        data.action = 'READY_FOR_GC';
      }

      return data;
    };

    this.parent$ = obs.filter(filterOutNullData).map(checkIfDisposeOrFadeout).takeWhile(this.notGCCOMPLETE);
    this.updateSourceSubscription(this.parent$, false, 'PARENT');
    this.renderAndAttachToParent(attachData);
  }

  addChildStream(obs$) {
    var _this6 = this;

    var filterOutNullData = function filterOutNullData(data) {
      return data !== undefined && data.action !== undefined;
    };

    var child$ = obs$.filter(filterOutNullData).do(function (p) {
      return _this6.tracer('addChildStraem do ', p);
    }).map(function (p) {
      return p;
    }) // .takeWhile(this.notGCSTATE)
    .finally(function (p) {
      return _this6.onChildCompleted(child$.source);
    });
    this.updateSourceSubscription(child$, true, 'CHILD');
  }

  onChildDisposed(p) {}

  onChildCompleted(p) {
    var findName = function findName(x) {
      var finalDest = function finalDest(y) {
        while (y.destination !== undefined) {
          y = finalDest(y.destination);
        }

        return y;
      };

      return R.pick(['viewName', 'cid'], finalDest(x));
    };

    var childCompletedData = findName(p);
    this.tracer('onChildCompleted ', this.checker, p); //console.log('obj is ',childCompletedName,obj,this.props);

    this.onChildDisposed(childCompletedData, p);
    return childCompletedData;
  }

  initAutoMergeSourceStreams() {
    var _this7 = this;

    // ====================== SUBSCRIPTION SOURCE =========================
    var subscriber = {
      next: this.onSubscribeToSourcesNext.bind(this),
      error: this.onSubscribeToSourcesError.bind(this),
      complete: this.onSubscribeToSourcesComplete.bind(this)
    }; // let takeBeforeGCOld = (val) => val.action !== 'GARBAGE_COLLECTED';
    // let takeBeforeGC = (p) => !p.action.includes('READY_FOR_GC');
    // let mapToState = (val) => ({action:val});
    //  =====================================================================
    // ========== METHODS TO CHECK FOR WHEN TO COMPLETE THE STREAM =========

    var completeAll = function completeAll() {
      _this7.props.el$.unmount();

      _this7.uberSource$.complete();

      _this7.autoSubscriber$.complete();

      _this7.sink$.complete();

      _this7.props = undefined;
      _this7.deleted = true;

      _this7.tracer('completeAll', _this7.deleted, _this7.props);
    };

    var decrementOnObservableClosed = function decrementOnObservableClosed() {
      obsCount -= 1;

      if (obsCount === 0) {
        completeAll();
      }
    }; //  =====================================================================
    // ======================== INIT STREAM METHODS ========================


    var obsCount = 0;
    this.uberSource$ = new Rx.Subject(); // ======================= COMPOSED RXJS OBSERVABLE ======================

    var incrementObservablesThatCloses = function incrementObservablesThatCloses() {
      obsCount += 1;
    };

    this.autoMergeSubject$ = this.uberSource$.mergeMap(function (obsData) {
      var branchObservable$ = obsData.observable.filter(function (p) {
        return p !== undefined && p.action !== undefined;
      }).map(function (p) {
        // console.log('PAYLOAD IS ', p, this.constructor.name)
        var payload = Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__["deepMerge"])({}, p);
        payload.action = p.action; // addRelationToState(obsData.rel, p.action);

        _this7.tracer('autoMergeSubject$', payload);

        return payload;
      });

      if (obsData.autoClosesBool === false) {
        return branchObservable$;
      } else {
        incrementObservablesThatCloses();
        return branchObservable$.finally(decrementOnObservableClosed);
      }
    }); // ============================= SUBSCRIBER ==============================

    this.autoSubscriber$ = this.autoMergeSubject$ // .do((p) => console.log('SINK DATA ', this.constructor.name, p))
    .filter(function (p) {
      return p !== undefined && p.action !== undefined;
    }).subscribe(subscriber);
  } // ========================= MERGE STREAMS TO MAIN SUBSCRIBER =================


  updateSourceSubscription(obs$, autoClosesBool, rel) {
    if (autoClosesBool === void 0) {
      autoClosesBool = false;
    }

    // const directionArr = sendDownStream === true ? this.$dirs.DI : this.$dirs.I;
    var obj = {
      observable: obs$,
      autoClosesBool: autoClosesBool,
      rel: rel
    };
    this.tracer('updateSourceSubscription ', this.checker, obj);
    this.uberSource$.next(obj);
  } // ============================= SUBSCRIBER METHODS ==============================


  onSubscribeToSourcesNext(payload) {
    var _this8 = this;

    if (payload === void 0) {
      payload = {};
    }

    var defaultToFn = R.defaultTo(function (p) {
      return _this8.sendExtendedStreams(p);
    }); // ****USE REGEX AS PREDICATE CHECK FOR PAYLOAD.ACTION IN HASH METHODS OBJ
    // const hashAction = this.props.hashSourceMethods[payload.action];

    var hashActionStr = Object(_utils_frp_tools__WEBPACK_IMPORTED_MODULE_3__["findStrOrRegexMatchStr"])(this.props.hashSourceMethods, payload.action);
    var hashAction = this.props.hashSourceMethods[hashActionStr]; // console.log('S PAYLOAD ', this.props.name, typeof (hashAction), payload);

    var fn = defaultToFn(hashAction); // console.log('hash methods ', fn, this.props.name, payload.action, hashActionStr, this.props.hashSourceMethods);

    fn(payload); // console.log(fn, payload, ' THE PAYLOAD FROM SUBSCRIBE IS ', ' ---- ', ' ---> ', this.props);
    // console.log('DISPOSER VS NEXT', this.constructor.name, payload);

    this.tracer('onSubscribeToSourcesNext', {
      payload: payload
    });
  }

  onSubscribeToSourcesError(payload) {
    if (payload === void 0) {
      payload = '';
    }

    console.log('ALL ERROR  ', this.constructor.name, payload);
  }

  onSubscribeToSourcesComplete() {
    // console.log('==== DISPOSER ALL COMPLETED ====', this.constructor.name);
    this.tracer('onSubscribeToSourcesComplete', 'GARBAGE_COLLECT');
    this.openSpigot('GARBAGE_COLLECT');
  } //  =======================================================================================
  // ============================= HASH KEY AND SPIGOT METHODS==============================


  get source$() {
    return this._source$;
  }

  sendExtendedStreams(payload) {
    this.tracer('sendExtendedStreams', payload); // console.log('extended methods ', payload.action, payload);

    this.openSpigot(payload.action, payload);
  } // ===================================== RENDER METHODS ==================================


  renderAndAttachToParent(attachData) {
    // let childRenderData = attachData;
    this.openSpigot('RENDER_AND_ATTACH_TO_PARENT', attachData);
  }

  renderView() {
    this.openSpigot('RENDER');
  }

  renderViewAndAttachToDom(node, type, attachType) {
    var attachData = {
      node: node,
      type: type,
      attachType: attachType
    };
    this.openSpigot('RENDER_AND_ATTACH_TO_DOM', {
      attachData: attachData
    });
  }

  attachChildToView(data) {} // let childRenderData = data.attachData;
  // console.log('CHILD DATA ', this.constructor.name, childRenderData);
  // this.openSpigot('ATTACH_CHILD_TO_SELF', {childRenderData});
  // ===================================== DISPOSE METHODS =================================


  checkParentDispose(p) {
    if (p.from$ === 'parent') {
      this.onDispose(p);
    }
  }

  onBeforeDispose() {}

  onDispose(p) {
    // console.log('DISPOSER VS onDispose ', this.constructor.name);
    this.onBeforeDispose();
    this.openSpigot('DISPOSE');
  }

  onChildDispose(p) {}

  onParentDisposing(p) {
    // this.updateSourceSubscription(this._source$);
    this.openSpigot('DISPOSE');
  }

  onReadyToGC(p) {
    var isInternal = p.from$ !== undefined && p.from$ === 'internal';

    if (isInternal) {// this.openSpigot('GARBAGE_COLLECT');
    }

    this.tracer('onReadyToGC', isInternal, p);
  } // ===================================== SINK$ METHODS =================================


  sendEventsDownStreamFn(o, action) {
    if (action === void 0) {
      action = {};
    }

    // console.log('OBJ ACTION ', o, action);
    var obj = Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__["deepMerge"])({
      action: action
    }, o); // obj['action'] = action;

    obj['$dir'] = this.$dirs.C; // console.log('OBJ FINAL ', obj);

    this.sourceStreams.raw$.next(obj);
  }

  openSpigot(action, obj) {
    if (obj === void 0) {
      obj = {};
    }

    if (this.props !== undefined) {
      this.props.action = action;
      var data = R.merge(this.props, obj);
      this.sink$.next(Object.freeze(data));
    }
  }

  setAttachData(attachType, query) {
    return {
      node: this.props.el,
      type: 'ViewToDomMediator',
      attachType: attachType,
      query: this.props.el.querySelector(query)
    };
  }

  getParentEls(el, num) {
    var getElem = function getElem(el) {
      return el.parentElement;
    };

    var iter = 0;
    var parentEl = el;

    while (iter < num) {
      parentEl = getElem(parentEl);
      iter++;
    }

    return parentEl;
  }

  setAttachParentData(attachType, query, level) {
    return {
      node: this.getParentEls(this.props.el, level),
      type: 'ViewToDomMediator',
      attachType: attachType,
      query: this.props.el.parentElement.querySelector(query)
    };
  }

  onMapViewSource(payload) {
    if (payload === void 0) {
      payload = {};
    }

    this.props = R.merge(this.props, payload);
    return payload;
  } // ====================== ATTACH STREAM AND DOM DATA AGGREGATORS==========================


  exchangeViewsWithChild(childView, attachData) {
    this.addChildStream(childView.sourceStreams.toParent$);
    childView.addParentStream(this.sourceStreams.toChild$, attachData);
  }
  /**
   *  Appends a ViewStream object to an existing dom element.
   *  @param {dom} node the ViewStream child that is to be attached.
   * @example
   * //  returns
   * <body>
   *    <h2>Hello World</h2>
   * </body>
   *
   * let viewStream = new ViewStream('h2', 'Hello World');
   * viewStream.appendToDom(document.body);
   *
   */


  appendToDom(node) {
    this.renderViewAndAttachToDom(node, 'dom', 'appendChild');
  }
  /**
   * Prepends the current ViewStream object to an existing dom element.
   * @param {dom} node the ViewStream child that is to be attached.
   *
   * @example
   * this.prependToDom(document.body);
   *
   */


  prependToDom(node) {
    this.renderViewAndAttachToDom(node, 'dom', 'prependChild');
  }
  /**
   * This method appends a child ViewStream object. <br>After the attachment, rxjs observables are exchanged between the parent and child ViewStream objects.<br><br>
   * @param {ViewStream} v the ViewStream child that is to be attached.
   * @param {string} query a querySelector within this ViewStream.
   *
   * @example
   * //  returns
   * <body>
   *    <main>
   *        <h2>Hello World</h2>
   *    </main>
   * </body>
   *
   *
   * let parentView = new ViewStream('main');
   * parentView.appendToDom(document.body);
   *
   * let childView = new ViewStream({tagName:'h2', data:'Hello World'};
   * parentView.appendView(childView)
   *
   * */


  appendView(v, query) {
    this.exchangeViewsWithChild(v, this.setAttachData('appendChild', query));
  }
  /**
   * This method appends a child ViewStream object to a parent ViewStream object.
   * @param {ViewStream} v the ViewStream parent.
   * @param {string} query a querySelector within this ViewStream.
   * @param {level} this parameters can attach the viewStream's dom element up the dom tree while still maintaining the parent-child relationship of the ViewStream objects.
   *
   * @example
   * //  returns
   * <body>
   *    <main>
   *        <h2>Hello World</h2>
   *    </main>
   * </body>
   *
   *
   * let parentView = new ViewStream('main');
   * parentView.appendToDom(document.body);
   *
   * let childView = new ViewStream({tagName:'h2', data:'Hello World'};
   * childView.appendToParent(parentView)
   *
   * */


  appendViewToParent(v, query, level) {
    if (level === void 0) {
      level = 1;
    }

    this.exchangeViewsWithChild(v, this.setAttachParentData('appendChild', query, level));
  }
  /**
   * This method prepends a child ViewStream object to a parent ViewStream object.
   * @param {ViewStream} v the ViewStream parent.
   * @param {string} query a querySelector within this ViewStream.
   * @param {number} level this parameter can attach the viewStream's dom element up the dom tree while still maintaining the parent-child relationship of the ViewStream objects.
   *
   * @example
   * let parentView = new ViewStream('main');
   * parentView.prependToDom(document.body);
   *
   * let childView = new ViewStream({tagName:'h2', data:'Hello World'};
   * childView.prependViewToParent(parentView)
   *
   * */


  prependViewToParent(v, query, level) {
    if (level === void 0) {
      level = 1;
    }

    this.exchangeViewsWithChild(v, this.setAttachParentData('prependChild', query, level));
  }
  /**
   *
   *
   * This method prepends a child ViewStream object to the current ViewStream object. <br>After the attachment, rxjs observables are exchanged between the parent and child ViewStream objects.<br><br>
   * @param {ViewStream} v the ViewStream child that is to be attached.
   * @param {string} query a querySelector within this ViewStream.
   *
   * @example
   * //  returns
   * <body>
   *    <main>
   *        <h2>Hello World</h2>
   *    </main>
   * </body>
   *
   * let parentView = new ViewStream('main');
   * parentView.appendToDom(document.body);
   *
   * let childView = new ViewStream({tagName:'h2', data:'Hello World'};
   * parentView.prependView(childView);
   *
   * */


  prependView(v, query) {
    this.exchangeViewsWithChild(v, this.setAttachData('prependChild', query));
  }
  /**
   *  Appends a ViewStream object that are not rendered to the #spyne-null-views div.
   */


  appendToNull() {
    var node = document.getElementById('spyne-null-views');
    this.renderViewAndAttachToDom(node, 'dom', 'appendChild');
  }

  onRendered(payload) {
    // console.log('RENDER: ', this.props.name, payload);
    if (payload.from$ === 'internal') {
      // this.props['el'] = payload.el.el;
      this.postRender(); // this.broadcaster = new Spyne.ViewStreamBroadcaster(this.props, this.broadcastEvents);
    }
  }

  postRender() {
    this.beforeAfterRender();
    this.afterRender();
    this.viewsStreamBroadcaster = new _view_stream_broadcaster__WEBPACK_IMPORTED_MODULE_7__["ViewStreamBroadcaster"](this.props, this.broadcastEvents);
  }

  beforeAfterRender() {
    this.props.el$ = new _dom_item_selectors__WEBPACK_IMPORTED_MODULE_10__["DomItemSelectors"](this.props.el); // console.log('EL IS ', this.props.el$.elArr);
    // window.theEl$ = this.props.el$;
  } // ================================= METHODS TO BE EXTENDED ==============================

  /**
   *
   * This method is called once the ViewStream's domElement has been rendered and attached to the dom.
   * <br>
   * This method is empty and is meant to be overridden.
   *
   * */
  // THIS IS AN EVENT HOLDER METHOD BECAUSE SENDING DOWNSTREAM REQUIRE THE PARENT TO HAVE A METHOD


  downStream() {}

  afterRender() {}
  /**
   *
   * Add any query within the ViewStream's dom and any dom events to automatically be observed by the UI Channel.
   * <br>
   * @example
   *
   *  broadcastEvents() {
     *  // ADD BUTTON EVENTS AS NESTED ARRAYS
     *  return [
     *       ['#my-button', 'mouseover'],
     *       ['#my-input', 'change']
     *     ]
     *   }
   *
   *
   * */


  broadcastEvents() {
    // ADD BUTTON EVENTS AS NESTED ARRAYS
    return [];
  }
  /**
   *
   * Automatically connect to an instance of registered channels, such as 'DOM', 'UI', and 'ROUTE' channels.
   *
   *
   * @example
   *
   * let uiChannel = this.getChannel('UI');
   *
   * uiChannel
   *    .filter((p) => p.data.id==='#my-button')
   *    .subscribe((p) => console.log('my button was clicked ', p));
   *
   * */


  getChannel(channel) {
    var _this9 = this;

    var isValidChannel = function isValidChannel(c) {
      return Object(_channels_channels_config__WEBPACK_IMPORTED_MODULE_6__["registeredStreamNames"])().includes(c);
    };

    var error = function error(c) {
      return console.warn("channel name " + c + " is not within " + _channels_channels_config__WEBPACK_IMPORTED_MODULE_6__["registeredStreamNames"]);
    };

    var startSubscribe = function startSubscribe(c) {
      return window.Spyne.channels.getStream(c).observer.takeWhile(function (p) {
        return _this9.deleted !== true;
      });
    }; // getGlobalParam('streamsController').getStream(c).observer;


    var fn = R.ifElse(isValidChannel, startSubscribe, error);
    return fn(channel);
  }
  /**
   *
   * Preferred method to connect to instances of registered channels, such as 'DOM', 'UI', and 'ROUTE' channels.
   *
   * Add Channel will automatically unsubscribe to the channel, whereas the getChannel method requires the developer to manually unsubscribe.
   *
   * @param {string} str The name of the registered Channel that was added to the Channels Controller.
   * @param {boolean} bool false, add true if the View should wait for this channel to unsubscribe before removing itself.
   * @param {sendDownStream} bool The direction where the stream is allowed to travel.
   *
   * @example
   *
   * let routeChannel = this.addChannel('ROUTE');
   *
   *      addActionListeners() {
     *           return [
     *             ['CHANNEL_ROUTE_CHANGE_EVENT', 'onMapRouteEvent']
     *           ]
     *       }
   *
   *       onMapRouteEvent(p) {
     *          console.log('the route value is ', p);
     *       }
   *
   *
   * */


  addChannel(str, sendDownStream, bool) {
    var _this10 = this;

    if (sendDownStream === void 0) {
      sendDownStream = false;
    }

    if (bool === void 0) {
      bool = false;
    }

    var directionArr = sendDownStream === true ? this.$dirs.CI : this.$dirs.I;

    var mapDirection = function mapDirection(p) {
      var p2 = R.defaultTo({}, R.clone(p));
      var dirObj = {
        $dir: directionArr
      };
      return Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_2__["deepMerge"])(dirObj, p2); // Object.assign({$dir: directionArr}, R.clone(p))
    };

    var isLocalEventCheck = R.path(['srcElement', 'isLocalEvent']);
    var cidCheck = R.path(['srcElement', 'cid']);

    var cidMatches = function cidMatches(p) {
      var cid = cidCheck(p);
      var isLocalEvent = isLocalEventCheck(p);
      var filterEvent = isLocalEvent !== true || cid === _this10.props.cid; //console.log("checks ",cid,this.props.cid, isLocalEvent,filterEvent);

      return filterEvent;
    };

    var channel$ = this.getChannel(str).map(mapDirection).filter(cidMatches);
    this.updateSourceSubscription(channel$, false);
  }
  /**
   * Method to send data to any registered channel.
   * @param {string} channelName The name of the registered Channel that was added to the Channels Controller.
   * @param {string} action The event type that listeners can point to.
   * @param {object} payload {}, The main data to send to the channel.
   * @example
   * let payload = {'location' : 'about'};
   * let action = 'PAGE_CHANGE_EVENT';
   * this.sendChannelPayload('ROUTE', paylaod, action);
   *
   * */


  sendChannelPayload(channelName, payload, action) {
    if (payload === void 0) {
      payload = {};
    }

    if (action === void 0) {
      action = "VIEWSTREAM_EVENT";
    }

    var data = {
      payload: payload,
      action: action
    };
    data['srcElement'] = {}; // R.pick(['cid','viewName'], data);

    data.srcElement['cid'] = this.props.id;
    data.srcElement['isLocalEvent'] = false;
    data.srcElement['viewName'] = this.props.name;
    var obs$ = Rx.Observable.of(data);
    return new _channels_channels_payload__WEBPACK_IMPORTED_MODULE_8__["ChannelsPayload"](channelName, obs$, data);
  }

  tracer() {}

  isLocalEvent(channelStreamItem) {
    var itemEl = R.path(['srcElement', 'el'], channelStreamItem);
    return itemEl !== undefined && this.props.el.contains(channelStreamItem.srcElement.el);
  } //  =======================================================================================


  addMixins() {
    //  ==================================
    // BASE CORE MIXINS
    //  ==================================
    var coreMixins = Object(_utils_mixins_base_core_mixins__WEBPACK_IMPORTED_MODULE_0__["baseCoreMixins"])();
    this.createId = coreMixins.createId;
    this.createpropsMap = coreMixins.createpropsMap;
    this.convertDomStringMapToObj = _utils_frp_tools__WEBPACK_IMPORTED_MODULE_3__["convertDomStringMapToObj"];
    this.ifNilThenUpdate = _utils_frp_tools__WEBPACK_IMPORTED_MODULE_3__["ifNilThenUpdate"]; // this.gc = gc.bind(this);
    //  ==================================
    // BASE STREAM MIXINS
    //  ==================================

    var streamMixins = Object(_utils_mixins_base_streams_mixins__WEBPACK_IMPORTED_MODULE_1__["baseStreamsMixins"])();
    this.sendUIPayload = streamMixins.sendUIPayload;
    this.sendRoutePayload = streamMixins.sendRoutePayload;
    this.createLifeStreamPayload = streamMixins.createLifeStreamPayload;
  }

}

/***/ }),

/***/ "./src/spyne/views/view-to-dom-mediator.js":
/*!*************************************************!*\
  !*** ./src/spyne/views/view-to-dom-mediator.js ***!
  \*************************************************/
/*! exports provided: ViewToDomMediator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewToDomMediator", function() { return ViewToDomMediator; });
/* harmony import */ var _utils_mixins_base_core_mixins__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/mixins/base-core-mixins */ "./src/spyne/utils/mixins/base-core-mixins.js");
/* harmony import */ var _dom_item__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dom-item */ "./src/spyne/views/dom-item.js");
/* harmony import */ var _utils_frp_tools__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/frp-tools */ "./src/spyne/utils/frp-tools.js");
/* harmony import */ var _utils_viewstream_animations__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/viewstream-animations */ "./src/spyne/utils/viewstream-animations.js");
/* harmony import */ var _utils_viewstream_lifecycle_observables__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/viewstream-lifecycle-observables */ "./src/spyne/utils/viewstream-lifecycle-observables.js");
/* harmony import */ var _utils_deep_merge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/deep-merge */ "./src/spyne/utils/deep-merge.js");







var Rx = __webpack_require__(/*! rxjs */ "rxjs");

var R = __webpack_require__(/*! ramda */ "ramda");

class ViewToDomMediator {
  constructor(sink$, viewProps, cid, vsName) {
    var _this = this;

    if (viewProps === void 0) {
      viewProps = {};
    }

    if (cid === void 0) {
      cid = '';
    }

    if (vsName === void 0) {
      vsName = 'theName';
    }

    this.addMixins();
    this._state = 'INIT';
    this.cid = cid;
    this.vsName = vsName;
    this.defaults = {
      debug: false,
      extendedHashMethods: {}
    };
    this.options = Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_5__["deepMerge"])(this.defaults, viewProps);

    var createExtraStatesMethod = function createExtraStatesMethod(arr) {
      var action = arr[0],
          funcStr = arr[1];

      _this.options.extendedHashMethods[action] = function (p) {
        return _this[funcStr](p);
      };
    };

    this.addActionListeners().forEach(createExtraStatesMethod);
    this.options.hashMethods = this.setHashMethods(this.options.extendedHashMethods);
    this.sink$ = sink$;
    this.sink$.subscribe(this.onSinkSubscribe.bind(this));
    this.$dirs = _utils_viewstream_lifecycle_observables__WEBPACK_IMPORTED_MODULE_4__["LifecyleObservables"].createDirectionalFiltersObject();
    this.addDefaultDir = _utils_viewstream_lifecycle_observables__WEBPACK_IMPORTED_MODULE_4__["LifecyleObservables"].addDefaultDir;
    this.sourceStreams = _utils_viewstream_lifecycle_observables__WEBPACK_IMPORTED_MODULE_4__["LifecyleObservables"].createDirectionalObservables(new Rx.Subject(), this.vsName, this.cid);
    this._source$ = this.sourceStreams.toInternal$; //  new Rx.Subject();
  }

  addActionListeners() {
    return [];
  }

  setHashMethods(extendedHashMethodsObj) {
    var _this2 = this;

    if (extendedHashMethodsObj === void 0) {
      extendedHashMethodsObj = {};
    }

    var defaultHashMethods = {
      'GARBAGE_COLLECT': function GARBAGE_COLLECT(p) {
        return _this2.onGarbageCollect(p);
      },
      'READY_FOR_GC': function READY_FOR_GC(p) {
        return _this2.onReadyForGC(p);
      },
      'DISPOSE': function DISPOSE(p) {
        return _this2.onDispose(p);
      },
      'RENDER': function RENDER(p) {
        return _this2.onRender(p);
      },
      'RENDER_AND_ATTACH_TO_PARENT': function RENDER_AND_ATTACH_TO_PARENT(p) {
        return _this2.onRenderAndAttachToParent(p);
      },
      'RENDER_AND_ATTACH_TO_DOM': function RENDER_AND_ATTACH_TO_DOM(p) {
        return _this2.onRenderAndAttachToDom(p);
      },
      'ATTACH_CHILD_TO_SELF': function ATTACH_CHILD_TO_SELF(p) {
        return _this2.onAttachChildToSelf(p);
      }
    };
    return Object(_utils_deep_merge__WEBPACK_IMPORTED_MODULE_5__["deepMerge"])(defaultHashMethods, extendedHashMethodsObj);
  }

  createDomItem() {
    this.props = this.props !== undefined ? this.props : {};

    var removeIsNil = function removeIsNil(val) {
      return val !== undefined;
    };

    var attrs = R.filter(removeIsNil, R.pick(['id', 'className'], this.props));
    return new _dom_item__WEBPACK_IMPORTED_MODULE_1__["DomItem"](this.props.tagName, attrs, this.props.data, this.props.template);
  }

  onDisposeCompleted(d) {// console.log('bv self disposed after animateOut ', d, this);
  }

  animateInTween(el, time) {
    Object(_utils_viewstream_animations__WEBPACK_IMPORTED_MODULE_3__["fadein"])(el, time);
  }

  animateOutTween(el, time, callback) {
    // console.log('anim out ', {el, time, callback});
    Object(_utils_viewstream_animations__WEBPACK_IMPORTED_MODULE_3__["fadeout"])(el, time, callback);
  }

  setAnimateIn(d) {
    if (d.animateIn === true) {
      var el = d.el !== undefined ? d.el : this.domItem.el;
      this.animateInTween(el, d.animateOutTime);
    }
  }

  disposeMethodOld(d) {
    var _this3 = this;

    var animateOut = function animateOut(d, callback) {
      var el = d.el.el !== undefined ? d.el.el : d.el; // DOM ITEMS HAVE THEIR EL ITEMS NESTED

      _this3.animateOutTween(el, d.animateOutTime, callback);
    };

    var fadeOutObs = Rx.Observable.bindCallback(animateOut);

    var onFadeoutCompleted = function onFadeoutCompleted(e) {
      // console.log('fade out completed ', e, d);
      _this3._source$.next({
        action: 'READY_FOR_GC',
        $dir: _this3.$dirs.I
      });
    };

    var onFadeoutObs = function onFadeoutObs(d) {
      fadeOutObs(d).subscribe(onFadeoutCompleted);
      return {
        action: 'DISPOSING',
        $dir: _this3.$dirs.CI
      };
    };

    var onEmptyObs = function onEmptyObs() {
      return {
        action: 'DISPOSE_AND_READY_FOR_GC',
        $dir: _this3.$dirs.PCI
      };
    };

    var fn = d.animateOut === true ? onFadeoutObs : onEmptyObs;
    return fn(d);
  }

  disposeMethod(d) {
    var _this4 = this;

    var onFadeoutObs = function onFadeoutObs() {
      var el = d.el.el !== undefined ? d.el.el : d.el; // DOM ITEMS HAVE THEIR EL ITEMS NESTED

      var gcData = {
        action: 'READY_FOR_GC',
        $dir: _this4.$dirs.PI,
        el: el
      };
      d.el$.setClass(d.animateOutClass); // console.log('DISPOSE FADE OUT ', el, this.$dirs, d.animateOutClass);

      var subscriber = function subscriber() {
        // console.log('MEDIATOR FADEOUT COMPLETE ', this.cid, gcData, this.animateOutClass, d);
        _this4._source$.next(gcData);
      };

      Rx.Observable.fromEvent(el, 'transitionend').filter(function (e) {
        return e.target === el;
      }).take(1).subscribe(subscriber);
    };

    var onEmptyObs = function onEmptyObs() {
      return {
        action: 'DISPOSE_AND_READY_FOR_GC',
        $dir: _this4.$dirs.CI
      };
    };

    if (d.animateOutClass !== undefined) {
      onFadeoutObs();
      return {
        action: 'DISPOSING',
        $dir: this.$dirs.CI
      };
    } else {
      return onEmptyObs();
    }
  }

  onDispose(d) {
    return this.disposeMethod(d);
  }

  removeStream() {
    // this.sourceStreams.completeAll();
    if (this.sourceStreams !== undefined) {
      this.sourceStreams.completeStream(['internal', 'child']);
    } // this._source$.complete();
    // this._source$.isStopped = true;

  }

  onGarbageCollect9(p) {
    // console.log('MEDIATOR onGarbageCollect ', this.cid, this.vsName, p);
    var t = this.vsName === 'PageChildBox' ? 1000 : 0;
    window.setTimeout(this.onGarbageCollectRun.bind(this), t);
  }

  onReadyForGC(p) {
    this.removeStream();
  }

  onGarbageCollect(p) {
    // console.log('MEDIATOR onGarbageCollect ', this.cid, this.vsName, p);
    this.domItem.unmount();

    if (this.sourceStreams !== undefined) {
      this.sourceStreams.completeStream(['parent']);
    }

    delete this;
  }

  getSourceStream() {
    return this._source$;
  }

  combineDomItems(d) {
    var container = R.isNil(d.query) ? d.node : d.query;

    var prepend = function prepend(node, item) {
      return node.insertBefore(item, node.firstChild);
    };

    var append = function append(node, item) {
      return node.appendChild(item);
    }; // DETERMINE WHETHER TO USE APPEND OR PREPEND
    // ON CONNECTING DOM ITEMS TO EACH OTHER
    // this.domItemEl = this.domItem.render();


    var attachFunc = d.attachType === 'appendChild' ? append : prepend; // d.node = R.isNil(d.query) ? d.node : d.query;

    attachFunc(container, this.domItem.render());
    this.setAnimateIn(d);
  }

  onAttachChildToSelf(p) {
    var data = p.childRenderData;
    this.combineDomItems(data);
    return {
      action: 'CHILD_ATTACHED',
      $dir: this.$dirs.PI
    };
  }

  onRenderAndAttachToParent(d) {
    this.onRender(d);
    this.combineDomItems(d);
    return {
      action: 'RENDERED_AND_ATTACHED_TO_PARENT',
      el: this.domItem.el,
      $dir: this.$dirs.PI
    };
  }

  renderDomItem(d) {
    this.domItem = new (Function.prototype.bind.apply(_dom_item__WEBPACK_IMPORTED_MODULE_1__["DomItem"], [null].concat(d)))();
    return this.domItem;
  }

  onRender(d) {
    var _this5 = this;

    var getEl = function getEl(data) {
      return _this5.renderDomItem(data);
    };

    var el = getEl(R.props(['tagName', 'domAttributes', 'data', 'template'], d));
    return {
      action: 'RENDERED',
      el: el,
      $dir: this.$dirs.I
    };
  }

  extendedMethods(data) {}

  onRenderAndAttachToDom(d) {
    var _this6 = this;

    var getEl = function getEl(data) {
      return _this6.renderDomItem(data);
    }; // let getEl = (data) => new DomItem(...data);


    d.attachData['el'] = getEl(R.props(['tagName', 'domAttributes', 'data', 'template'], d));
    this.combineDomItems(d.attachData);
    return {
      action: 'RENDERED_AND_ATTACHED_TO_DOM',
      el: d.attachData['el'].el,
      $dir: this.$dirs.CI
    };
  }

  onSinkSubscribe(payload) {
    var _this7 = this;

    var action = payload.action;
    var defaultToFn = R.defaultTo(function (data) {
      return _this7.extendedMethods(data);
    });
    var fn = defaultToFn(this.options.hashMethods[action]); // console.log('MEDIATOR onSinkSubscribe before ', this.cid, action, payload);

    var data = fn(payload); // data = this.addDefaultDir(data);
    // console.log('add default dir ', data);

    var sendData = function sendData(d) {
      return _this7._source$.next(d);
    };

    if (data !== undefined) {
      // console.log('MEDIATOR onSinkSubscribe ', this.cid, data, payload);
      sendData(Object.freeze(data));
    }
  }

  addMixins() {
    //  ==================================
    // BASE CORE MIXINS
    //  ==================================
    var coreMixins = Object(_utils_mixins_base_core_mixins__WEBPACK_IMPORTED_MODULE_0__["baseCoreMixins"])();
    this.createId = coreMixins.createId;
    this.createpropsMap = coreMixins.createpropsMap;
    this.convertDomStringMapToObj = _utils_frp_tools__WEBPACK_IMPORTED_MODULE_2__["convertDomStringMapToObj"];
    this.ifNilThenUpdate = _utils_frp_tools__WEBPACK_IMPORTED_MODULE_2__["ifNilThenUpdate"];
  }

}

/***/ }),

/***/ "ramda":
/*!**********************************************************************************!*\
  !*** external {"commonjs":"ramda","commonjs2":"ramda","amd":"ramda","root":"R"} ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_ramda__;

/***/ }),

/***/ "rxjs":
/*!********************************************************************************!*\
  !*** external {"commonjs":"rxjs","commonjs2":"rxjs","amd":"rxjs","root":"Rx"} ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs__;

/***/ })

/******/ });
});