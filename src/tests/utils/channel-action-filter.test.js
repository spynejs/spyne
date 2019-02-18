import {ChannelActionFilter} from '../../spyne/utils/channel-action-filter';
import {internalViewStreamPayload} from '../mocks/viewstream-internal-payload.mocks';
import {spyneDocsDomStr} from '../mocks/spyne-docs.mocks';
internalViewStreamPayload.srcElement.el = document.querySelector('.has-svg.github');

const R = require('ramda');
describe('channel action filter', () => {
  let payload = internalViewStreamPayload;

  beforeEach(function(){
     document.body.insertAdjacentHTML('afterbegin', spyneDocsDomStr);
     payload.srcElement.el = document.querySelector('.has-svg.github');
   }
  );

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('app'));
  });
  it('Create a new ChannelActionFilter', () => {
    let filter = new ChannelActionFilter();
    let filterConstructor = filter.constructor.name;
    return filterConstructor.should.equal('Array');

  });

  it('String selector match but no data', ()=>{
    let filter = new ChannelActionFilter('#header ul li:last-child');
    let filterVal = filter[0](payload);
    console.log(filterVal, 'filter val string');
    return true;
  });

  it('selectors array contains match but no data', ()=>{
    let filterArr = new ChannelActionFilter(['#header ul li:last-child','#header ul li:first-child' ]);
    let filterVal = filterArr[0](payload);
    console.log(filterVal, 'filter val array ');
    return true;
  });

  it('Static Data and String Selector returns true', ()=>{
    let str = '#header ul li:last-child';
    let data = {
      type:'link',
      linkType:  'external'
    };
    let filter = new ChannelActionFilter(str,data);;
    let filterStrVal = filter[0](payload);
    let filterDataVal = filter[1];

    console.log({filterStrVal, filterDataVal}, 'filter string data1 ',filterDataVal(payload));

    return true;
  })

  it('Dynamic Data and String Selector returns true', ()=>{
    let str = '#header ul li:last-child';
    let data = {
      type: (str)=>str==='link',
      linkType:  R.test(/ext.*nal/)
    };
    let filter = new ChannelActionFilter(str,{});;
    let filterStrVal = filter[0](payload);
    let filterDataVal = filter[1];

    console.log({filterStrVal, filterDataVal}, 'DYNAMIC string data1 ',filterDataVal(payload));

    return true;
  })


});