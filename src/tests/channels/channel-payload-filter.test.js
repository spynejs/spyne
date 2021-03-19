const {expect, assert} = require('chai');
import {ChannelPayloadFilter} from '../../spyne/utils/channel-payload-filter';

describe('should test channel payload filters', () => {

  it('find the payload value of selectors', () => {

    const cpFilter = new ChannelPayloadFilter('.test');

    console.log('the payload of channel payload filter ',cpFilter)

    return true;

  });

});
