import {spyneDocsDomStr} from '../mocks/spyne-docs.mocks';
import {DomItemSelectors} from '../../spyne/views/dom-item-selectors';

import * as R from 'ramda';
describe('channel action filter', () => {

  beforeEach(function(){
     document.body.insertAdjacentHTML('afterbegin', spyneDocsDomStr);
   }
  );

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('app'));
  });
  it('should test dom selector', () => {


    //console.log(zappo('ul').addClass("ubunow"))
   return true;

  });



});