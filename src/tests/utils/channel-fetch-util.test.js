import {ChannelFetchUtil} from '../../spyne/utils/channel-fetch-util';

describe('ChannelFetchUtil Tests', () => {

  const mapFn = (p)=>{
    console.log('mapping fetch data ',p);
    return p;
  };

  let url = 'https://jsonplaceholder.typicode.com/posts/1';


  let props = {
    mapFn, url,
    method: 'GET',
  };


  let propsPost = {
    mapFn, url,
    method: 'POST',
    body: {
      id: 101,
      title: 'foo',
      body: 'bar',
      userId: 1
    }
  };

  let propsWBodyAsString = {
    url,
    method: 'POST',
      body: 'bar',
  };

  let propsGetStringified = {
    "method": "GET",
    "url": "https://jsonplaceholder.typicode.com/posts/1"
  };


  let propsStringified = {
    "body": "{\"id\":101,\"title\":\"foo\",\"body\":\"bar\",\"userId\":1}",
    "method": "POST",
    "url": "https://jsonplaceholder.typicode.com/posts/1"
  };

  const baseServerOptions = {method: 'GET', headers: {"Content-type": 'application/json; charset=UTF-8'}};


  describe('stringify body method', ()=>{

    it('should convert body object to string', ()=>{
        let bodyStr = ChannelFetchUtil.stringifyBodyIfItExists(propsPost);
        bodyStr = R.omit(['mapFn'], bodyStr);
        expect(bodyStr).to.deep.equal(propsStringified);

    });

    it('should not parse body when its a string',()=>{
        let bodyStr =ChannelFetchUtil.stringifyBodyIfItExists(propsWBodyAsString);

        expect(bodyStr).to.deep.equal(propsWBodyAsString);
    });

    it('should not add body param if its missing',()=>{
      let bodyStr =ChannelFetchUtil.stringifyBodyIfItExists(props);
      bodyStr = R.omit(['mapFn'], bodyStr);
      expect(bodyStr).to.deep.equal(propsGetStringified);
    });



  });



  describe('create a new fetch util', () => {
    let subscriber = (data)=>console.log('data retruned ',data);
    let p = R.clone(props);
    //p.responseType = 'text';

    console.log("PROPS P",p);

    let channelFetchUtil = new ChannelFetchUtil(p, subscriber);
    describe('return vals from fetch util',()=>{

      it('should return correct server option', ()=>{
        let serverOptions = R.omit(['mapFn'], channelFetchUtil.serverOptions);
        expect(serverOptions).to.deep.equal(baseServerOptions);
      });


      it('should return correct response type', ()=>{
        expect(channelFetchUtil.responseType).to.equal('json');
      });

      it('should return correct url', ()=>{
        console.log("REPONSE URL ",channelFetchUtil.url);
        expect(channelFetchUtil.url).to.equal(url);
      });



    });



  });

});