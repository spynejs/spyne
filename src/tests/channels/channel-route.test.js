// const assert = require('assert');

import { SpyneUtilsChannelRouteUrl } from '../../spyne/utils/spyne-utils-channel-route-url';
import { ChannelPayloadRouteData, ChannelPayloadRouteDataRegexOverride } from '../mocks/channel-payload-data';

import {
  SpyneConfigData,
  RouteDataForTests,
  routeConfigWithRegexOverride,
  windowLocationData
} from '../mocks/utils-data';
import { SpyneChannelRoute } from '../../spyne/channels/spyne-channel-route';
const R = require('ramda');
const ObjtoStr = JSON.stringify;

chai.use(require('chai-dom'));

const routeConfig = SpyneConfigData.channels.ROUTE;

describe('Channel Route', () => {
  it('should return window relevant data', () => {
    const locationParamsArr = [
      'href',
      'origin',
      'protocol',
      'host',
      'hostname',
      'port',
      'pathname',
      'search',
      'hash'];
    let locationObj = R.pickAll(locationParamsArr, window.location);
    let routeLocationObj = SpyneChannelRoute.getLocationData();
    expect(ObjtoStr(routeLocationObj)).to.equal(ObjtoStr(locationObj));
  });

  it('should return payload from params', () => {
    let payload = ChannelPayloadRouteData;
    let routePayload = SpyneChannelRoute.getDataFromParams(payload, routeConfig);
    expect(routePayload).to.be.an('object');
  });

  it('should return slash route string from params', () => {
    let data = RouteDataForTests.multiple.data;
    let queryStr = RouteDataForTests.multiple.slash;
    let routeFromParams = SpyneChannelRoute.getRouteStrFromParams(data, routeConfig);
    expect(routeFromParams).to.equal(queryStr);
  });

  it('should return query route string from params', () => {
    let data = RouteDataForTests.multiple.data;
    let queryStr = RouteDataForTests.multiple.query;
    let routeFromParams = SpyneChannelRoute.getRouteStrFromParams(data, routeConfig, 'query');
    expect(routeFromParams).to.equal(queryStr);
  });

  it('should return params object from slash string', () => {
    let data = RouteDataForTests.multiple.data;
    let queryStr = RouteDataForTests.multiple.slash;
    let paramsFromRoute = SpyneChannelRoute.getParamsFromRouteStr(queryStr, routeConfig);

    //console.log('params from str is ',queryStr)
    expect(ObjtoStr(paramsFromRoute.routeData)).to.equal(ObjtoStr(data));
  });

  it('should return params object from slash string using array in routeConfig', () => {
    let data = RouteDataForTests.multipleRegexComplex.data;
    let queryStr = RouteDataForTests.multipleRegexComplex.slash;
    routeConfig.routes.routePath['work'] =   'holographs|photos|digital|videos';
    let paramsFromRoute = SpyneChannelRoute.getParamsFromRouteStr(queryStr, routeConfig);

    //console.log('params from str is ',JSON.stringify(paramsFromRoute))

     expect(ObjtoStr(paramsFromRoute.routeData)).to.equal(ObjtoStr(data));
  });

  it('should return params object from query string', () => {
    let data = RouteDataForTests.multiple.data;
    let queryStr = RouteDataForTests.multiple.query;
    let paramsFromRoute = SpyneChannelRoute.getParamsFromRouteStr(queryStr, routeConfig, 'query');
    expect(ObjtoStr(paramsFromRoute.routeData)).to.equal(ObjtoStr(data));
  });

 describe("It shouold add automatically add next param", ()=>{

   const pl =
       {
         payload: {
           "eventPreventDefault": "true",
           "imageNum": "work",
           "pageId": "page-one",
           "text": "WORK",
           "endRoute": "true",
           "topicId": ""
         }

       }

   const plNoPageId =
       {
         payload: {
           "eventPreventDefault": "true",
           "imageNum": "work",
           "text": "WORK",
           "endRoute": "true",
           "topicId": ""
         }

       }
   const {ROUTE} = SpyneConfigData.channels;
   const {routeNamesArr} = ROUTE;
   const routeConfigJson = ROUTE;

   it('should find the author param based on endRoute bool', ()=>{
     const updateForEndRoute = SpyneChannelRoute.checkForEndRoute(pl, routeConfigJson);
     const {author} = updateForEndRoute.payload;
     expect(author).to.equal('');

   })

   it('should find the ramdonNum param based on endRoute bool', ()=>{
     const newPl = R.clone(pl);
     newPl.payload.pageId='page-three';
     const updateForEndRoute = SpyneChannelRoute.checkForEndRoute(newPl, routeConfigJson);
     const {randomNum} = updateForEndRoute.payload;
     expect(randomNum).to.equal('');

   })


   it('should not yield any results and send warning', ()=>{
     const newPl = R.clone(pl);
     newPl.payload.pageId='page-three';
     newPl.payload.randomNum = "thirty-two";
     const updateForEndRoute = SpyneChannelRoute.checkForEndRoute(newPl, routeConfigJson);
     expect(updateForEndRoute).to.deep.equal(newPl);


   })
   it('should determine first param is missing', ()=>{
     const updateForEndRoute = SpyneChannelRoute.checkForEndRoute(plNoPageId, routeConfigJson);
     //console.log('updateForEndRoute ',updateForEndRoute)
     expect(updateForEndRoute).to.deep.equal(plNoPageId);

   })
   it('should determine first param is missing and last param is entered', ()=>{
     const newPl = R.clone(plNoPageId);
     newPl.payload.randomNum = "thirty-two";
     const updateForEndRoute = SpyneChannelRoute.checkForEndRoute(newPl, routeConfigJson);
     //console.log('updateForEndRoute ',updateForEndRoute)
     expect(updateForEndRoute).to.deep.equal(newPl);

   })


 })

 /* it('return route str by config type', () => {
    const val = SpyneUtilsChannelRouteUrl.getLocationStrByType('hash');
    // console.log('route str val is ',val,' -->',ObjtoStr(window.location));

    return true;
  });

  it('should combine any regex tokens into the route string', () => {
    let payloadOverrideCheck = SpyneChannelRoute.checkForRouteParamsOverrides(ChannelPayloadRouteDataRegexOverride);
     console.log("override check ",payloadOverrideCheck);
    return true;
  });*/
});
