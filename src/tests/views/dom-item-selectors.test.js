import { spyneDocsDomStr } from '../mocks/spyne-docs.mocks';
import { DomItemSelector, generateEl } from '../../spyne/views/dom-item-selector';

import * as R from 'ramda';

describe('Dom Item Selector', () => {
  beforeEach(function() {
    document.body.insertAdjacentHTML('afterbegin', spyneDocsDomStr);
  }
  );

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('app'));
  });

  it('should return the same el', ()=>{
    let el = document.querySelector("ul#my-list");
    let elNode = generateEl(el);
    let elNodesEqual = el.isEqualNode(elNode);
    expect(elNodesEqual).to.eq(true);
  })

  it('should return local li', () => {
    let el = document.querySelector("ul#my-list");
    let el$ =   DomItemSelector("ul#my-list");
    //console.log("EL IS ",el$);
    console.log("EL 2 IS ",el$('li'));
    return true;
  });
});
