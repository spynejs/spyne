import {ChannelActionFilter} from '../../spyne/utils/channel-action-filter';
import {internalViewStreamPayload,internvalRouteChannelPayload} from '../mocks/viewstream-internal-payload.mocks';
import {spyneDocsDomStr} from '../mocks/spyne-docs.mocks';
internalViewStreamPayload.srcElement.el = document.querySelector('.has-svg.github');

const R = require('ramda');
describe('channel action filter', () => {
  let payload = internalViewStreamPayload;
  let obj = R.clone(payload);
  payload= R.mergeDeepRight(obj.channelPayload,obj.srcElement, {channel:obj.channel}, {event:obj.event});
  payload['action'] = obj.action;

  let payloadRoute = internvalRouteChannelPayload

  beforeEach(function(){
     document.body.insertAdjacentHTML('afterbegin', spyneDocsDomStr);
     payload.el = document.querySelector('.has-svg.github');
   }
  );

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('app'));
  });
  it('Create a new ChannelActionFilter', () => {
    let filter = new ChannelActionFilter();
    let filterConstructor = filter.constructor.name;
    return filterConstructor.should.equal('Function');

  });

  it('String selector only with no data', ()=>{
    let filter = new ChannelActionFilter('#header ul li:last-child');
    let filterVal = filter(payload);
    console.log(filterVal, 'filter val string');
    expect(filterVal).to.eq(true);
  });

  it('Selectors array contains match but no data', ()=>{
    let filter = new ChannelActionFilter(['#header ul li:last-child','#header ul li:first-child' ]);
    let filterVal = filter(payload);
    expect(filterVal).to.eq(true);
  });

  it('Static Data and String Selector returns true', ()=>{
    let str = '#header ul li:last-child';
    let data = {
      type:'link',
      linkType:  'external'
    };
    let filter = new ChannelActionFilter(str,data);;
    let filterVal = filter(payload);

    expect(filterVal).to.eq(true);
  });

  it('Dynamic Data and String Selector returns true', ()=>{
    let str = '#header ul li:last-child';
    let data = {
      type: (str)=>str==='link',
      linkType:  R.test(/ext.*nal/)
    };
    let filter = new ChannelActionFilter(str,data);;
    let filterVal = filter(payload);

    expect(filterVal).to.eq(true);
  });

  it('Dynamic Data with no selector returns true', ()=>{
    let str = '#header ul li:last-child';
    let data = {
      type: (str)=>str==='link',
      linkType:  R.test(/ext.*nal/)
    };
    let filter = new ChannelActionFilter(undefined,data);
    let filterVal = filter(payload);

    expect(filterVal).to.eq(true);
  });


  it('Empty String selector with no data', ()=>{
    let filter = new ChannelActionFilter('');
    let filterVal = filter(payload);
    expect(filterVal).to.eq(false);
  });

  it('Empty Arrays of selectors with no data', ()=>{
    let filter = new ChannelActionFilter(['', "#header ul li:first-child"]);
    let filterVal = filter(payload);
    expect(filterVal).to.eq(false);
  });

  it('Dynamic Data with no selector returns false', ()=>{
    let str = '#header ul li:last-child';
    let data = {
      type: (str)=>str==='Incorrect',
      linkType:  R.test(/ext.*nal/)
    };
    let filter = new ChannelActionFilter(undefined,data);
    let filterVal = filter(payload);
    expect(filterVal).to.eq(false);
  });

  it('False array and false dynamic data', ()=>{
    let str = '#header ul li:last-child';
    let data = {
      type: (str)=>str==='Incorrect',
      linkType:  R.test(/ext.*nal/)
    };
    let filter = new ChannelActionFilter(['', "#header ul li:first-child"], data);
    let filterVal = filter(payload);

    expect(filterVal).to.eq(false);
  });


});