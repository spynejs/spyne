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
      let bodyStr = ChannelFetchUtil.stringifyBodyIfItExists(propsPost)
      bodyStr = R.omit(['mapFn'], bodyStr)
      expect(bodyStr).to.deep.equal(propsStringified)
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

    it('should return correct server option', () => {
      const serverOptions = R.omit(['mapFn'], channelFetchUtil.serverOptions)
      expect(serverOptions).to.deep.equal(baseServerOptions)
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
})
