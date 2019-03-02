// const assert = require('assert');

import {RouteUtils} from '../../spyne/utils/channel-util-route';

import {
  SpyneConfigData,
  RouteDataForTests,
  windowLocationData
} from '../mocks/utils-data';
import {ChannelRoute} from '../../spyne/channels/channel-route';

const ObjtoStr = JSON.stringify;

const routeConfig = SpyneConfigData.channels.ROUTE;

describe('Route Utils', () => {
  it('flattenConfigObjects should return array of params', () => {
    const finalArr = ['pageId', '', 'imageNum', 'author', 'photogNum', 'randomNum'];
    let arr = RouteUtils.flattenConfigObject(routeConfig.routes);
    // return true;
    expect(arr).to.deep.equal(finalArr);
  });

  it('get route arr data should remove unused params', () => {
    const paramsArr = ['pageId', '', 'imageNum', 'author', 'photogNum'];
    const arr = ['imageNum', 'pageId', 'author'];
    const routedArr = ['pageId', 'imageNum', 'author'];
    let routeObj = RouteUtils.getRouteArrData(arr, paramsArr);
    expect(routeObj.routeKeywordsArr).to.deep.equal(routedArr);
  });
});

describe('it should compare two objects for updated keys', ()=>{
  let obj1 = {
    "pageId": "guide",
    "section": "reference"
  };


  it('should compare the two objs', ()=>{
      console.log('comparing');

    return true;
  })



})