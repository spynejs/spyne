import { ChannelPayloadFilter } from '../../spyne/utils/channel-payload-filter';
import { internalViewStreamPayload, internvalRouteChannelPayload } from '../mocks/viewstream-internal-payload.mocks';
import { spyneDocsDomStr } from '../mocks/spyne-docs.mocks';

import * as R from 'ramda';
import {UnsubscriptionError} from 'rxjs';
internalViewStreamPayload.srcElement.el = document.querySelector('.has-svg.github');
describe('channel action filter', () => {
  let payload = internalViewStreamPayload;
  let obj = R.clone(payload);
  payload = R.mergeDeepRight(obj.channelPayload, obj.srcElement, { channel:obj.channel }, { event:obj.event });
  payload['action'] = obj.action;

  let payloadRoute = internvalRouteChannelPayload;

  beforeEach(function() {
    document.body.insertAdjacentHTML('afterbegin', spyneDocsDomStr);
    payload.el = document.querySelector('.has-svg.github');
  }
  );

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('app'));
  });
  it('Create a new ChannelPayloadFilter', () => {
    let filter = new ChannelPayloadFilter({test:true});
    let filterConstructor = filter.constructor.name;
    return filterConstructor.should.equal('Function');
  });

  it('String selector only with no data', () => {
    let filter = new ChannelPayloadFilter({selector: '#header ul li:last-child'});
    let filterVal = filter(payload);
    // console.log(filterVal, 'filter val string');
    expect(filterVal).to.eq(true);
  });

  it('Selectors array contains match but no data', () => {
    let filter = new ChannelPayloadFilter({selector:['#header ul li:last-child', '#header ul li:first-child' ]});
    let filterVal = filter(payload);
    expect(filterVal).to.eq(true);
  });


  it('Selectors array as first prop contains match but no data', () => {
    let filter = new ChannelPayloadFilter(['#header ul li:last-child', '#header ul li:first-child']);
    let filterVal = filter(payload);
    expect(filterVal).to.eq(true);
  });


  it('Static Data and String Selector returns true', () => {
    let selector = '#header ul li:last-child';
    let propFilters = {
      type:'link',
      linkType:  'external'
    };
    let filter = new ChannelPayloadFilter({propFilters, selector});
    let filterVal = filter(payload);

    expect(filterVal).to.eq(true);
  });

  it('Dynamic Data and String Selector returns true', () => {
    let selector = '#header ul li:last-child';
    let propFilters = {
      type: (str) => str === 'link',
      linkType:  R.test(/ext.*nal/)
    };
    let filter = new ChannelPayloadFilter({propFilters, selector});
    let filterVal = filter(payload);

    expect(filterVal).to.eq(true);
  });

  it('Dynamic Data with no selector returns true', () => {
    let selector = '#header ul li:last-child';
    let propFilters = {
      type: (str) => str === 'link',
      linkType:  R.test(/ext.*nal/)
    };
    let filter = new ChannelPayloadFilter({propFilters, selector});
    let filterVal = filter(payload);

    expect(filterVal).to.eq(true);
  });

  it('Empty Filter', () => {
    const testMode = true;
    let filter = new ChannelPayloadFilter({testMode});
    const {selector, propFilters} = filter;
    const isEmpty = selector === undefined && R.isEmpty(propFilters);
    expect(isEmpty).to.eq(true);
  });

  it('Empty String selector with no data', () => {
    const testMode = true;
    let filter = new ChannelPayloadFilter('',{},undefined,testMode);
    const {selector, propFilters} = filter;
    const isEmpty = R.isEmpty(selector) && R.isEmpty(propFilters);
    expect(isEmpty).to.eq(true);
  });

  it('Arrays of selectors with no data', () => {
    let filter = new ChannelPayloadFilter(['a.test', 'a.b'], {});
    let filterVal = filter(payload);
    expect(filterVal).to.eq(false);
  });

  it('Dynamic Data with no selector returns false', () => {
    let str = '#header ul li:last-child';
    let data = {
      type: (str) => str === 'Incorrect',
      linkType:  R.test(/ext.*nal/)
    };
    let filter = new ChannelPayloadFilter(undefined, data);
    let filterVal = filter(payload);
    expect(filterVal).to.eq(false);
  });

  it('False array and false dynamic data', () => {
    let str = '#header ul li:last-child';
    let data = {
      type: (str) => str === 'Incorrect',
      linkType:  R.test(/ext.*nal/)
    };
    let filter = new ChannelPayloadFilter(['', '#header ul li:first-child'], data);
    let filterVal = filter(payload);

    expect(filterVal).to.eq(false);
  });
});
