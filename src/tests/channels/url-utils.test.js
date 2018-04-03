// const assert = require('assert');

import {URLUtils} from '../../spyne/utils/channel-util-urls';
import {SpyneConfigData, RouteDataForTests} from '../mocks/utils-data';

chai.use(require('chai-dom'));

const routeConfig = SpyneConfigData.channels.ROUTE;

describe('URL Utils - Params To Route', () => {
  describe('Route query string should parse into query obj', () => {
    it('output multiple keywords from slash query', () => {
      let data = RouteDataForTests.multiple.data;
      let queryStr = RouteDataForTests.multiple.query;
      let paramsFromRoute = URLUtils.convertRouteToParams(queryStr, routeConfig, 'query');
      expect(JSON.stringify(paramsFromRoute.keywords)).to.equal(JSON.stringify(data));
    });
    it('output single keywords from slash query', () => {
      let data = RouteDataForTests.singleBasic.data;
      let queryStr = RouteDataForTests.singleBasic.query;
      let paramsFromRoute = URLUtils.convertRouteToParams(queryStr, routeConfig, 'query');
      expect(JSON.stringify(paramsFromRoute.keywords)).to.equal(JSON.stringify(data));
    });
    it('output home keywords from slash query', () => {
      let data = RouteDataForTests.home.data;
      let queryStr = RouteDataForTests.home.query;
      let paramsFromRoute = URLUtils.convertRouteToParams(queryStr, routeConfig, 'query');
      expect(JSON.stringify(paramsFromRoute.keywords)).to.equal(JSON.stringify(data));
    });
  });

  describe('Route slash string should parse into query obj', () => {
    it('output multiple keywords from slash query', () => {
      let data = RouteDataForTests.multiple.data;
      let slashStr = RouteDataForTests.multiple.slash;
      let paramsFromRoute = URLUtils.convertRouteToParams(slashStr, routeConfig);
      // console.log('data query multiple1 ',slashStr,paramsFromRoute.keywords);
      expect(JSON.stringify(paramsFromRoute.keywords)).to.equal(JSON.stringify(data));
    });

    it('output multiple regex keywords from slash query', () => {
      let data = RouteDataForTests.multipleRegex.data;
      let slashStr = RouteDataForTests.multipleRegex.slash;
      let paramsFromRoute = URLUtils.convertRouteToParams(slashStr, routeConfig);
      // console.log('data query regex str to keywords ',data,slashStr,paramsFromRoute.keywords);
      // return true;
      expect(JSON.stringify(paramsFromRoute.keywords)).to.equal(JSON.stringify(data));
    });

    it('output single keywords from slash query', () => {
      let data = RouteDataForTests.singleBasic.data;
      let slashStr = RouteDataForTests.singleBasic.slash;
      let paramsFromRoute = URLUtils.convertRouteToParams(slashStr, routeConfig);
      // console.log('data query multiple1 ',slashStr,paramsFromRoute.keywords);
      expect(JSON.stringify(paramsFromRoute.keywords)).to.equal(JSON.stringify(data));
    });

    it('output home keywords from slash query', () => {
      let data = RouteDataForTests.home.data;
      let slashStr = RouteDataForTests.home.slash;
      let paramsFromRoute = URLUtils.convertRouteToParams(slashStr, routeConfig);
      // console.log('data query multiple1 ',slashStr,paramsFromRoute.keywords,data);
      expect(JSON.stringify(paramsFromRoute.keywords)).to.equal(JSON.stringify(data));
    });
  });

  describe('Should create array of route keywords from obj', () => {
    it('should return multiple keywords in arr', () => {
      let data = RouteDataForTests.multiple.data;
      let correctRouteArr = RouteDataForTests.multiple.arr;
      let route = routeConfig.routes.route;
      let routeVal = URLUtils.createRouteArrayFromParams(data, route);
      expect(JSON.stringify(routeVal)).to.equal(correctRouteArr);
    });

    it('should return single keyword in arr', () => {
      let data = RouteDataForTests.single.data;
      let correctRouteArr = RouteDataForTests.single.arr;
      let route = routeConfig.routes.route;
      let routeVal = URLUtils.createRouteArrayFromParams(data, route);
      expect(JSON.stringify(routeVal)).to.equal(correctRouteArr);
    });

    it('should return home keyword in arr', () => {
      let data = RouteDataForTests.home.data;
      let correctRouteArr = RouteDataForTests.home.arr;
      let route = routeConfig.routes.route;
      let routeVal = URLUtils.createRouteArrayFromParams(data, route);
      expect(JSON.stringify(routeVal))
        .to.equal(JSON.stringify(correctRouteArr));
    });
    it('should return empty keyword in arr', () => {
      let data = RouteDataForTests.empty.data;
      let correctRouteArr = RouteDataForTests.empty.arr;
      let route = routeConfig.routes.route;
      let routeVal = URLUtils.createRouteArrayFromParams(data, route);
      // console.log('data empty ',JSON.stringify(routeVal),correctRouteArr);
      expect(1).to.equal(1);
    });
  }); // END ARRAY OF ROUTE PARAMS
  describe('Params should translate to slash routes', () => {
    it('output multiple keywords query', () => {
      let data = RouteDataForTests.multiple.data;
      let correctRouteQuery = RouteDataForTests.multiple.slash;
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'slash');
      // console.log('data query multiple ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal);
    });
    it('Params based on regex should translate to slash routes', () => {
      let data = RouteDataForTests.multipleRegex.data;
      let correctRouteQuery = RouteDataForTests.multipleRegex.slash;
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'slash');
      // console.log('data query multiple 1',data, correctRouteQuery, routeVal);
      expect(correctRouteQuery).to.equal(routeVal);
    });

    it('nested keyword route should translate to slash routes', () => {
      let data = RouteDataForTests.multiple.data;
      data = R.omit(['pageId', 'imageNum'], data);
      let correctRouteQuery = RouteDataForTests.multiple.slash;
      correctRouteQuery = 'page-one/5/doe';
      let updatedQuery = 'page-one/5/ubalu';
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'slash', correctRouteQuery);
      // console.log('data query multiple 1',data, correctRouteQuery, routeVal);
      // console.log(' data: ',updatedQuery, correctRouteQuery, routeVal);
      expect(routeVal).to.equal(updatedQuery);
    });

    it('nested keyword route should not display if missing in between slash routes', () => {
      let data = RouteDataForTests.multiple.data;
      data = R.omit(['pageId', 'imageNum'], data);
      let correctRouteQuery = 'page-one';
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'slash', correctRouteQuery);
      // console.log('data query multiple 1',data, correctRouteQuery, routeVal);
      expect(routeVal).to.equal(correctRouteQuery);
    });

    it('nested keyword route should translate to hash routes', () => {
      let thisRouteConfig = R.clone(routeConfig);
      thisRouteConfig.isHash = true;
      let data = RouteDataForTests.multiple.data;
      data = R.omit(['pageId', 'imageNum'], data);
      let correctRouteQuery = RouteDataForTests.multiple.slash;
      correctRouteQuery = 'page-one/5/sdfdf';
      let updatedQuery = 'page-one/5/ubalu';
      let routeVal = URLUtils.convertParamsToRoute(data, thisRouteConfig, 'slash', correctRouteQuery);
      // console.log('data query multiple 1',data, correctRouteQuery, routeVal,updatedQuery);
      // console.log(' data: ',updatedQuery, correctRouteQuery, routeVal);
      // return true;
      expect(routeVal).to.equal(updatedQuery);
    });

    it('output single keywords query', () => {
      let data = RouteDataForTests.single.data;
      let correctRouteQuery = RouteDataForTests.single.slash;
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'slash');
      // console.log('data query single ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal);
    });
    it('output home keywords query', () => {
      let data = RouteDataForTests.home.data;
      let correctRouteQuery = RouteDataForTests.home.slash;
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'slash');
      // console.log('data query home ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal);
    });
    it('output empty keywords query', () => {
      let data = RouteDataForTests.empty.data;
      let correctRouteQuery = RouteDataForTests.empty.slash;
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'slash', correctRouteQuery);
      // console.log('data query empty ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal);
    });
  });

  describe('Params should translate to query routes', () => {
    it('output multiple keywords query', () => {
      let data = RouteDataForTests.multiple.data;
      let correctRouteQuery = RouteDataForTests.multiple.query;
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'query');
      // console.log('data query multiple ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal);
    });

    it('output multiple keywords with regex query', () => {
      let data = RouteDataForTests.multipleRegex.data;
      let correctRouteQuery = RouteDataForTests.multipleRegex.query;
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'query');
      // console.log('data query multiple ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal);
    });

    it('output single keywords query', () => {
      let data = RouteDataForTests.single.data;
      let correctRouteQuery = RouteDataForTests.single.query;
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'query');
      // console.log('data query single ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal);
    });
    it('output home keywords query', () => {
      let data = RouteDataForTests.home.data;
      let correctRouteQuery = RouteDataForTests.home.query;
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'query');
      // console.log('data query home ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal);
    });
    it('output empty keywords query', () => {
      let data = RouteDataForTests.empty.data;
      let correctRouteQuery = RouteDataForTests.empty.query;
      let routeVal = URLUtils.convertParamsToRoute(data, routeConfig, 'query');
      // console.log('data query empty ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal);
    });
  });
});
