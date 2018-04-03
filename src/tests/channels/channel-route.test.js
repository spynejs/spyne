// const assert = require('assert');

import {URLUtils} from '../../spyne/utils/channel-util-urls';
import {ChannelPayloadRouteData} from '../mocks/channel-payload-data';

import {
  SpyneConfigData,
  RouteDataForTests,
  windowLocationData
} from '../mocks/utils-data';
import {ChannelRoute} from '../../spyne/channels/channel-route';

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
    let routeLocationObj = ChannelRoute.getLocationData();
    expect(ObjtoStr(routeLocationObj)).to.equal(ObjtoStr(locationObj));
  });

  it('should return payload from params', () => {
    let payload = ChannelPayloadRouteData;
    let routePayload = ChannelRoute.getDataFromParams(payload, routeConfig);
    expect(routePayload).to.be.an('object');
  });

  it('should return slash route string from params', () => {
    let data = RouteDataForTests.multiple.data;
    let queryStr = RouteDataForTests.multiple.slash;
    let routeFromParams = ChannelRoute.getRouteStrFromParams(data, routeConfig);
    expect(routeFromParams).to.equal(queryStr);
  });

  it('should return query route string from params', () => {
    let data = RouteDataForTests.multiple.data;
    let queryStr = RouteDataForTests.multiple.query;
    let routeFromParams = ChannelRoute.getRouteStrFromParams(data, routeConfig, 'query');
    expect(routeFromParams).to.equal(queryStr);
  });

  it('should return params object from slash string', () => {
    let data = RouteDataForTests.multiple.data;
    let queryStr = RouteDataForTests.multiple.slash;
    let paramsFromRoute = ChannelRoute.getParamsFromRouteStr(queryStr, routeConfig);
    expect(ObjtoStr(paramsFromRoute.keywords)).to.equal(ObjtoStr(data));
  });

  it('should return params object from query string', () => {
    let data = RouteDataForTests.multiple.data;
    let queryStr = RouteDataForTests.multiple.query;
    let paramsFromRoute = ChannelRoute.getParamsFromRouteStr(queryStr, routeConfig, 'query');
    expect(ObjtoStr(paramsFromRoute.keywords)).to.equal(ObjtoStr(data));
  });

  it('return route str by config type', () => {
    const val = URLUtils.getLocationStrByType('hash');
    // console.log('route str val is ',val,' -->',ObjtoStr(window.location));

    return true;
  });
});
