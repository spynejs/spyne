import {ChannelActionFilter} from '../../spyne/utils/channel-action-filter';
import {internalViewStreamPayload} from '../mocks/viewstream-internal-payload.mocks';
import {spyneDocsDomStr} from '../mocks/spyne-docs.mocks';

const R = require('ramda');
describe('channel action filter', () => {
  let payload = internalViewStreamPayload;
  payload.srcElement.el = document.querySelector('.has-svg.github');

  beforeEach(function() {
    document.body.insertAdjacentHTML(
        'afterbegin',
        spyneDocsDomStr);


  });

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('app'));
  });
  it('create a new channel action filter', () => {
    let filter = new ChannelActionFilter();
    let filterConstructor = filter.constructor.name;
    return filterConstructor.should.equal('Array');

  });

  it('should filter a String selector but no data', ()=>{
    let payload = internalViewStreamPayload;
    payload.srcElement.el = document.querySelector('.has-svg.github');
    let elFromPayload = R.path(['srcElement', 'el'], payload);
    let filter = new ChannelActionFilter('#header2 ul li:last-child');
    let el = document.querySelector('#header ul li:last-child');
    console.log(filter[0](payload)," JSON ",el.isEqualNode(payload.srcElement.el));
    return true;
  });

  it('should filter an Array of selectors but no data', ()=>{
    let payload = internalViewStreamPayload;
    payload.srcElement.el = document.querySelector('.has-svg.github');
    let filterArr = new ChannelActionFilter(['#header ul li:last-child','#header ul li:first-child' ]);
    //let el = document.querySelector('#header ul li:last-child');
    console.log("JSON ARRAY ",filterArr[0](payload));;
    return true;
  })

  it('should filter an String selectors and Data', ()=>{
    let str = '#header ul li:last-child';
    let data = {type: 'link'};
    let filter = new ChannelActionFilter(str,data);;
    //let el = document.querySelector('#header ul li:last-child');
    //console.log("JSON ",el.isEqualNode(payload.srcElement.el));;
    return true;
  })



});