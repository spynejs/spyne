import {ChannelFetchUtil} from '../../spyne/utils/channel-fetch-util';

describe('testing ChannelFetchUtil', () => {

  let url = 'https://jsonplaceholder.typicode.com/posts/1';
  let options = {

    method: 'POST',
    body: {
      id: 101,
      title: 'foo',
      body: 'bar',
      userId: 1
    }
  };


  it('create a new fetch util', () => {

    let subscriber = (data)=>console.log('data retruned ',data);

    let channelFetchUtil = new ChannelFetchUtil(url,options, subscriber);

    console.log("channel fetch util ",channelFetchUtil.serverOptions);


    return true;

  });

});