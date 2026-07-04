import { from, of } from 'rxjs'
import { catchError, map, mergeMap, share, tap } from 'rxjs/operators'
import { compose, prop, defaultTo, pick, mergeDeepRight } from 'ramda'
import sanitizeData from './sanitize-data.js'

export class ChannelFetchUtil {
  /**
   * @module ChannelFetchUtil
   * @type util
   *
   * @desc
   * This is the core object used for ChannelFetch. This utility wraps the JavaScript
   * fetch API into an observable.
   *
   * @constructor
   * @param {Object} options Properties used to create the fetch request
   * @param {Function} subscriber A method assigned to listen to the result
   * @param {Boolean} testMode Controls initialization for unit tests
   * @param {String} CHANNEL_NAME The name of the channel using this fetch util
   *
   * @property {String} options.url - The URL used for the request
   * @property {Object} options.serverOptions - The properties for the request
   * @property {Function} options.mapFn - A method that can parse the data before it is returned
   * @property {String} options.responseType - Default is json
   * @property {Boolean} options.debug - Logs fetch response details before observable completes
   * @property {Boolean} options.disableSanitize - Allows trusted fetch data to skip sanitization
   *
   * @returns The fetched response parsed by the configured parameters.
   */

  constructor(options = {}, subscriber, testMode, CHANNEL_NAME) {
    const testSubscriber = p => console.log('FETCH RETURNED ', p)

    this._mapFn = ChannelFetchUtil.setMapFn(options)
    this._url = ChannelFetchUtil.setUrl(options)
    this._responseType = ChannelFetchUtil.setResponseType(options)
    this._serverOptions = ChannelFetchUtil.setServerOptions(options)
    this._subscriber = subscriber !== undefined ? subscriber : testSubscriber
    this.debug = options?.debug === true
    this.disableSanitize = options?.disableSanitize === true
    this.channelName = CHANNEL_NAME

    const fetchProps = {
      mapFn: this.mapFn,
      url: this.url,
      serverOptions: this.serverOptions,
      responseType: this.responseType,
      disableSanitize: this.disableSanitize,
      debug: this.debug
    }

    if (testMode !== true) {
      ChannelFetchUtil.startWindowFetch(fetchProps, this._subscriber, this.channelName)
    }
  }

  static startWindowFetch(props, subscriber, channelName) {
    const { mapFn, url, serverOptions, responseType, debug } = props

    const metadata = {
      channelName,
      url,
      responseType,
      serverOptions
    }

    const tapLogDebug = p => {
      console.log('DEBUG FETCH :', p, metadata)
    }

    const tapLog = debug === true ? tap(tapLogDebug) : tap(() => {})

    const mapWrapper = mapMethod => data => {
      const disableSanitize = props?.disableSanitize === true

      // Fetched data is remote and untrusted: always sanitize in 'app' mode,
      // regardless of the application's authoring/richtext posture.
      const sanitizedData = disableSanitize ? data : sanitizeData(data, { mode: 'app' })

      return mapMethod(sanitizedData, metadata)
    }

    const response$ = from(window.fetch(url, serverOptions)).pipe(
      mergeMap(response =>
        from(ChannelFetchUtil.parseResponse(response, metadata))
      ),

      tapLog,

      map(mapWrapper(mapFn)),

      catchError(error =>
        of(ChannelFetchUtil.createFetchErrorPayload(error, metadata))
      ),

      share()
    )

    response$.subscribe(subscriber)
  }

  static async parseResponse(response, metadata) {
    const { responseType } = metadata

    const status = response.status
    const statusText = response.statusText
    const contentType = response.headers?.get?.('content-type') || ''

    const responseMetadata = {
      ...metadata,
      status,
      statusText,
      contentType,
      ok: response.ok
    }

    if (response.ok !== true) {
      const rawBody = await ChannelFetchUtil.safeReadText(response)

      throw ChannelFetchUtil.createFetchError({
        errorType: 'FETCH_HTTP_ERROR',
        message: `Fetch request failed with status ${status} ${statusText}`,
        metadata: responseMetadata,
        rawBody
      })
    }

    if (responseType === 'json') {
      return ChannelFetchUtil.parseJsonResponse(response, responseMetadata)
    }

    if (responseType === 'text') {
      return response.text()
    }

    if (responseType === 'blob') {
      return response.blob()
    }

    if (responseType === 'arrayBuffer') {
      return response.arrayBuffer()
    }

    if (responseType === 'formData') {
      return response.formData()
    }

    throw ChannelFetchUtil.createFetchError({
      errorType: 'FETCH_UNSUPPORTED_RESPONSE_TYPE',
      message: `Unsupported fetch responseType "${responseType}"`,
      metadata: responseMetadata
    })
  }

  static async parseJsonResponse(response, metadata) {
    const rawBody = await response.text()
    const trimmedBody = rawBody.trim()

    if (trimmedBody === '') {
      return null
    }

    try {
      return JSON.parse(trimmedBody)
    } catch (error) {
      throw ChannelFetchUtil.createFetchError({
        errorType: 'FETCH_RESPONSE_PARSE_ERROR',
        message: 'Expected JSON but could not parse response body.',
        metadata,
        rawBody,
        originalError: error
      })
    }
  }

  static createFetchError({ errorType, message, metadata, rawBody = '', originalError }) {
    const error = new Error(message)

    error.isChannelFetchError = true
    error.errorType = errorType
    error.metadata = metadata
    error.rawBody = rawBody
    error.originalError = originalError

    return error
  }

  static createFetchErrorPayload(error, metadata) {
    const fetchMetadata = error?.metadata || metadata || {}

    return {
      isChannelFetchError: true,
      isError: true,
      error: true,
      errorType: error?.errorType || 'FETCH_UNKNOWN_ERROR',
      message: error?.message || 'Unknown ChannelFetchUtil error',

      channelName: fetchMetadata.channelName,
      url: fetchMetadata.url,
      responseType: fetchMetadata.responseType,
      status: fetchMetadata.status,
      statusText: fetchMetadata.statusText,
      contentType: fetchMetadata.contentType,
      ok: fetchMetadata.ok,

      rawBodyPreview: ChannelFetchUtil.truncateBody(error?.rawBody),

      originalErrorMessage: error?.originalError?.message
    }
  }

  static truncateBody(body = '', maxLength = 500) {
    if (typeof body !== 'string') {
      return ''
    }

    return body.length > maxLength
      ? `${body.slice(0, maxLength)}...`
      : body
  }

  static async safeReadText(response) {
    try {
      return await response.text()
    } catch (error) {
      return ''
    }
  }

  static setMapFn(opts) {
    const getFn = compose(defaultTo(p => p), prop('mapFn'))
    return getFn(opts)
  }

  static setUrl(opts) {
    const url = prop('url', opts)

    if (url === undefined) {
      console.warn('SPYNE WARNING: URL is undefined for data channel')
    }

    return url
  }

  static setResponseType(opts) {
    return defaultTo('json', prop('responseType', opts))
  }

  get mapFn() {
    return this._mapFn
  }

  get url() {
    return this._url
  }

  get serverOptions() {
    return this._serverOptions
  }

  get responseType() {
    return this._responseType
  }

  static stringifyBodyIfItExists(obj) {
    const body = obj?.body

    const shouldStringifyBody =
      body !== null &&
      typeof body === 'object' &&
      body.constructor === Object

    if (shouldStringifyBody !== true) {
      return obj
    }

    const headers = new Headers(obj.headers || {})

    if (headers.has('Content-Type') !== true) {
      headers.set('Content-Type', 'application/json')
    }

    return {
      ...obj,
      headers,
      body: JSON.stringify(body)
    }
  }

  static updateMethodWhenBodyExists(opts) {
    const hasBody = opts?.body !== undefined
    const method = opts?.method || 'GET'

    if (hasBody && method.toUpperCase() === 'GET') {
      console.warn(
        'SPYNE WARNING: Fetch body was provided with method GET. Changing method to POST.',
        opts
      )

      return {
        ...opts,
        method: 'POST'
      }
    }

    return opts
  }

  static setServerOptions(opts) {
    const options = pick([
      'method',
      'headers',
      'body',
      'mode',
      'credentials',
      'cache',
      'redirect',
      'referrer',
      'referrerPolicy',
      'integrity',
      'keepalive'
    ], opts)

    let mergedOptions = mergeDeepRight(ChannelFetchUtil.baseOptions(), options)

    mergedOptions = ChannelFetchUtil.updateMethodWhenBodyExists(mergedOptions)
    mergedOptions = ChannelFetchUtil.stringifyBodyIfItExists(mergedOptions)

    return mergedOptions
  }

  static baseOptions() {
    return {
      method: 'GET',

      headers: new Headers({
        Accept: 'application/json, text/plain, */*'
      }),

      mode: 'cors',
      credentials: 'same-origin',
      cache: 'default',
      redirect: 'follow',
      referrerPolicy: 'no-referrer-when-downgrade',
      integrity: '',
      keepalive: false
    }
  }
}
