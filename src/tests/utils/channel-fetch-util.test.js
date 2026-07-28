import { ChannelFetchUtil } from '../../spyne/utils/channel-fetch-util'

describe('ChannelFetchUtil Tests', () => {
  const mapFn = (p) => {
    console.log('mapping fetched data ', p)
    return p
  }

  const url = 'https://jsonplaceholder.typicode.com/posts/1'

  const props = {
    mapFn,
    url,
    method: 'GET'
  }

  const propsPost = {
    mapFn,
    url,
    method: 'POST',
    body: {
      id: 101,
      title: 'foo',
      body: 'bar',
      userId: 1
    }
  }

  const propsWBodyAsString = {
    url,
    method: 'POST',
    body: 'bar'
  }

  const propsGetStringified = {
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1'
  }

  const propsStringified = {
    body: '{"id":101,"title":"foo","body":"bar","userId":1}',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts/1'
  }

  // const baseServerOptions = { method: 'GET', headers: {  "Accept": "application/json, text/plain, */*" } };

  const baseServerOptions = ChannelFetchUtil.baseOptions()

  describe('stringify body method', () => {
    it('should convert body object to string', () => {
      const result = ChannelFetchUtil.stringifyBodyIfItExists(propsPost)
      const bodyStr = R.omit(['mapFn', 'headers'], result)

      expect(bodyStr).to.deep.equal(propsStringified)
      expect(result.headers.get('Content-Type')).to.equal('application/json')
    })

    it('should not parse body when its a string', () => {
      const bodyStr = ChannelFetchUtil.stringifyBodyIfItExists(propsWBodyAsString)

      expect(bodyStr).to.deep.equal(propsWBodyAsString)
    })

    it('should not add body param if its missing', () => {
      let bodyStr = ChannelFetchUtil.stringifyBodyIfItExists(props)
      bodyStr = R.omit(['mapFn'], bodyStr)
      expect(bodyStr).to.deep.equal(propsGetStringified)
    })
  })

  describe('create a new fetch util', () => {
    const subscriber = (data) => console.log('data retruned ', data)
    const p = R.clone(props)
    // p.responseType = 'text';

    // console.log("PROPS P",p);

    const channelFetchUtil = new ChannelFetchUtil(p, subscriber, true)

    // Pins the RELATIONSHIP: default props must merge to the base untouched.
    // Note what it cannot do — baseServerOptions is computed by calling the
    // same production method under test, so drift in baseOptions() moves the
    // expectation with it. The literal assertion below covers that gap.
    it('should return correct server option', () => {
      const serverOptions = R.omit(['mapFn'], channelFetchUtil.serverOptions)
      expect(serverOptions).to.deep.equal(baseServerOptions)
    })

    // Pins the CONTENT, with literal values, because the deep-equal above is
    // vacuous for headers: a Headers instance exposes no own-enumerable keys,
    // so chai compares {} to {} and two Headers with entirely different
    // entries still pass. Read them through .get() to assert anything real.
    it('should carry the documented default options', () => {
      const opts = channelFetchUtil.serverOptions
      expect(opts.method).to.equal('GET')
      expect(opts.mode).to.equal('cors')
      expect(opts.credentials).to.equal('same-origin')
      expect(opts.cache).to.equal('default')
      expect(opts.redirect).to.equal('follow')
      expect(opts.headers.get('Accept')).to.equal('application/json, text/plain, */*')
    })

    it('should return correct response type', () => {
      expect(channelFetchUtil.responseType).to.equal('json')
    })

    it('should return correct url', () => {
      expect(channelFetchUtil.url).to.equal(url)
    })
  })

  /*  describe('it should fetch an image', ()=>{
    let imgUrl = "http://localhost/spyne/src/tests/mocks/imgs/goat.jpg";

    it ('should return the image', ()=>{
      let channelFetchUtil = new ChannelFetchUtil({url:imgUrl, responseType:'blob'}, subscriber);
      let subscriber = (data) => console.log('data retruned ', data);

      return true;
    })

  }); */

  describe('fetch util updates method to POST from GET when body exists', () => {
    const subscriber = (data) => console.log('data retruned ', data)
    const p = R.omit(['method', 'mapFn'], props)
    p.responseType = 'text'
    p.body = { foo:'bar' }

    const channelFetchUtil = new ChannelFetchUtil(p, subscriber, true)

    it('should return correct server option', () => {
      const serverOptions = R.omit(['mapFn'], channelFetchUtil.serverOptions)
      return true
    })

    it('should return correct response type', () => {
      expect(channelFetchUtil.responseType).to.equal('text')
    })

    it('should return correct url', () => {
      expect(channelFetchUtil.url).to.equal(url)
    })

    it('should return default mapFn', () => {
      expect(channelFetchUtil.mapFn).to.be.a('function')
    })
  })

  describe('conformed fetch error payload', () => {
    const metadata = {
      channelName: 'CHANNEL_MY_FETCHED_DATA',
      url,
      responseType: 'json'
    }

    it('should conform an http error into a flat payload with the discriminator flag', () => {
      const httpError = ChannelFetchUtil.createFetchError({
        errorType: 'FETCH_HTTP_ERROR',
        message: 'Fetch request failed with status 404 Not Found',
        metadata: { ...metadata, status: 404, statusText: 'Not Found', ok: false },
        rawBody: '{"error":"not found"}'
      })

      const errorPayload = ChannelFetchUtil.createFetchErrorPayload(httpError, metadata)

      expect(errorPayload.isChannelFetchError).to.be.true
      expect(errorPayload.isError).to.be.true
      expect(errorPayload.errorType).to.equal('FETCH_HTTP_ERROR')
      expect(errorPayload.status).to.equal(404)
      expect(errorPayload.statusText).to.equal('Not Found')
      expect(errorPayload.url).to.equal(url)
      expect(errorPayload.channelName).to.equal('CHANNEL_MY_FETCHED_DATA')
      expect(errorPayload.rawBodyPreview).to.equal('{"error":"not found"}')
    })

    it('should conform a network error using fallback metadata and error type', () => {
      const networkError = new TypeError('Failed to fetch')

      const errorPayload = ChannelFetchUtil.createFetchErrorPayload(networkError, metadata)

      expect(errorPayload.isChannelFetchError).to.be.true
      expect(errorPayload.errorType).to.equal('FETCH_UNKNOWN_ERROR')
      expect(errorPayload.message).to.equal('Failed to fetch')
      expect(errorPayload.url).to.equal(url)
      expect(errorPayload.status).to.be.undefined
    })
  })

  // Regression: custom headers used to reach fetch() in NEITHER spelling.
  // ChannelFetch's allow-lists carried 'header' (singular) while
  // setServerOptions picked 'headers' (plural), so each boundary dropped the
  // spelling the other one used. Compounding it, baseOptions().headers is a
  // Headers instance whose entries are not own-enumerable, so a deep merge
  // with a plain object silently discarded the Accept default.
  describe('custom headers reach the request in either spelling', () => {
    const asPlain = (h) =>
      h instanceof Headers ? Object.fromEntries(h.entries()) : { ...h }
    const accept = 'application/json, text/plain, */*'

    it('leaves the base Headers instance untouched when none are authored', () => {
      const opts = ChannelFetchUtil.setServerOptions({ method: 'GET' })
      expect(opts.headers instanceof Headers, 'base should pass through as-is').to.be.true
      expect(opts.headers.get('Accept')).to.equal(accept)
    })

    it('accepts headers (plural, the fetch spelling)', () => {
      const opts = ChannelFetchUtil.setServerOptions({ headers: { 'X-Api-Key': 'abc' } })
      const h = asPlain(opts.headers)
      expect(h['X-Api-Key']).to.equal('abc')
      expect(h.accept ?? h.Accept, 'base Accept must survive the merge').to.equal(accept)
    })

    it('accepts header (singular, the ChannelFetch spelling)', () => {
      const opts = ChannelFetchUtil.setServerOptions({ header: { 'X-Api-Key': 'def' } })
      const h = asPlain(opts.headers)
      expect(h['X-Api-Key']).to.equal('def')
      expect(h.accept ?? h.Accept, 'base Accept must survive the merge').to.equal(accept)
    })

    it('accepts a Headers instance', () => {
      const opts = ChannelFetchUtil.setServerOptions({ headers: new Headers({ 'X-Trace': 'on' }) })
      expect(asPlain(opts.headers)['x-trace']).to.equal('on')
    })

    it('lets an authored Content-Type win over the auto-set one', () => {
      const opts = ChannelFetchUtil.setServerOptions({
        method: 'POST',
        header: { 'Content-Type': 'application/vnd.api+json' },
        body: { a: 1 }
      })
      const h = asPlain(opts.headers)
      expect(h['content-type'] ?? h['Content-Type']).to.equal('application/vnd.api+json')
      expect(opts.body, 'object body still stringifies').to.equal('{"a":1}')
    })
  })
})
