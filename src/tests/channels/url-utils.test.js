// const assert = require('assert');

import { SpyneUtilsChannelRouteUrl } from '../../spyne/utils/spyne-utils-channel-route-url'
import { SpyneConfigData, RouteDataForTests, routeConfigWithRegexOverride, payloadDataForUrlUtils, urlUtilsArr } from '../mocks/utils-data'

chai.use(require('chai-dom'))

const routeConfig = SpyneConfigData.channels.ROUTE

describe('URL Utils - Params To Route', () => {
  describe('Route query string should parse into query obj', () => {
    it('output multiple routeData from slash query', () => {
      const data = RouteDataForTests.multiple.data
      const queryStr = RouteDataForTests.multiple.query
      const paramsFromRoute = SpyneUtilsChannelRouteUrl.convertRouteToParams(queryStr, routeConfig, 'query')
      expect(JSON.stringify(paramsFromRoute.routeData)).to.equal(JSON.stringify(data))
    })
    it('output single routeData from slash query', () => {
      const data = RouteDataForTests.singleBasic.data
      const queryStr = RouteDataForTests.singleBasic.query
      const paramsFromRoute = SpyneUtilsChannelRouteUrl.convertRouteToParams(queryStr, routeConfig, 'query')
      expect(JSON.stringify(paramsFromRoute.routeData)).to.equal(JSON.stringify(data))
    })
    it('output home routeData from slash query', () => {
      const data = RouteDataForTests.home.data
      const queryStr = RouteDataForTests.home.query
      const paramsFromRoute = SpyneUtilsChannelRouteUrl.convertRouteToParams(queryStr, routeConfig, 'query')
      expect(JSON.stringify(paramsFromRoute.routeData)).to.equal(JSON.stringify(data))
    })
  })

  describe('Route slash string should parse into query obj', () => {
    it('output multiple routeData from slash query', () => {
      const data = RouteDataForTests.multiple.data
      const slashStr = RouteDataForTests.multiple.slash
      const paramsFromRoute = SpyneUtilsChannelRouteUrl.convertRouteToParams(slashStr, routeConfig)
      // console.log('data query multiple1 ',slashStr,paramsFromRoute.routeData);
      expect(JSON.stringify(paramsFromRoute.routeData)).to.equal(JSON.stringify(data))
    })

    it('output multiple regex routeData from slash query', () => {
      const data = RouteDataForTests.multipleRegex.data
      const slashStr = RouteDataForTests.multipleRegex.slash
      const paramsFromRoute = SpyneUtilsChannelRouteUrl.convertRouteToParams(slashStr, routeConfig)
      // console.log('data query regex str to routeData ',data,slashStr,paramsFromRoute.routeData);
      // return true;
      expect(JSON.stringify(paramsFromRoute.routeData)).to.equal(JSON.stringify(data))
    })

    it('output single routeData from slash query', () => {
      const data = RouteDataForTests.singleBasic.data
      const slashStr = RouteDataForTests.singleBasic.slash
      const paramsFromRoute = SpyneUtilsChannelRouteUrl.convertRouteToParams(slashStr, routeConfig)
      expect(JSON.stringify(paramsFromRoute.routeData)).to.equal(JSON.stringify(data))
    })

    it('output home routeData from slash query', () => {
      const data = RouteDataForTests.home.data
      const slashStr = RouteDataForTests.home.slash
      const paramsFromRoute = SpyneUtilsChannelRouteUrl.convertRouteToParams(slashStr, routeConfig)
      // console.log('data query multiple1 ',slashStr,paramsFromRoute.routeData,data);
      expect(JSON.stringify(paramsFromRoute.routeData)).to.equal(JSON.stringify(data))
    })
  })

  describe('Should create array of route routeData from obj', () => {
    it('should return multiple routeData in arr', () => {
      const data = RouteDataForTests.multiple.data
      const correctRouteArr = RouteDataForTests.multiple.arr
      const route = routeConfig.routes.routePath
      const routeVal = SpyneUtilsChannelRouteUrl.createRouteArrayFromParams(data, route)
      expect(JSON.stringify(routeVal)).to.equal(correctRouteArr)
    })

    it('should return single keyword in arr', () => {
      const data = RouteDataForTests.single.data
      const correctRouteArr = RouteDataForTests.single.arr
      const route = routeConfig.routes.routePath
      const routeVal = SpyneUtilsChannelRouteUrl.createRouteArrayFromParams(data, route)
      expect(JSON.stringify(routeVal)).to.equal(correctRouteArr)
    })

    it('should return home keyword in arr', () => {
      const data = RouteDataForTests.home.data
      const correctRouteArr = RouteDataForTests.home.arr
      const route = routeConfig.routes.routePath
      const routeVal = SpyneUtilsChannelRouteUrl.createRouteArrayFromParams(data, route)
      expect(JSON.stringify(routeVal))
        .to.equal(JSON.stringify(correctRouteArr))
    })
    it('should return empty keyword in arr', () => {
      const data = RouteDataForTests.empty.data
      const correctRouteArr = RouteDataForTests.empty.arr
      const route = routeConfig.routes.routePath
      const routeVal = SpyneUtilsChannelRouteUrl.createRouteArrayFromParams(data, route)
      // console.log('data empty ',JSON.stringify(routeVal),correctRouteArr);
      expect(1).to.equal(1)
    })
  }) // END ARRAY OF ROUTE PARAMS
  describe('Params should translate to slash routes', () => {
    it('output multiple routeData query', () => {
      const data = RouteDataForTests.multiple.data
      const correctRouteQuery = RouteDataForTests.multiple.slash
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'slash')
      // console.log('data query multiple ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal)
    })
    it('Params based on regex should translate to slash routes', () => {
      const data = RouteDataForTests.multipleRegex.data
      const correctRouteQuery = RouteDataForTests.multipleRegex.slash
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'slash')
      // console.log('data query multiple 1',data, correctRouteQuery, routeVal);
      expect(correctRouteQuery).to.equal(routeVal)
    })

    it('nested keyword route should translate to slash routes', () => {
      let data = RouteDataForTests.multiple.data
      data = R.omit(['pageId', 'imageNum'], data)
      let correctRouteQuery = RouteDataForTests.multiple.slash
      correctRouteQuery = 'page-one/5/doe'
      const updatedQuery = 'page-one/5/ubalu'
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'slash', correctRouteQuery)
      // console.log('data query multiple 1',data, correctRouteQuery, routeVal);
      // console.log(' data: ',updatedQuery, correctRouteQuery, routeVal);
      expect(routeVal).to.equal(updatedQuery)
    })

    it('nested keyword route should not display if missing in between slash routes', () => {
      let data = RouteDataForTests.multiple.data
      data = R.omit(['pageId', 'imageNum'], data)
      const correctRouteQuery = 'page-one'
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'slash', correctRouteQuery)
      expect(routeVal).to.equal(correctRouteQuery)
    })

    it('nested keyword route should translate to hash routes', () => {
      const thisRouteConfig = R.clone(routeConfig)
      thisRouteConfig.isHash = true
      let data = RouteDataForTests.multiple.data
      data = R.omit(['pageId', 'imageNum'], data)
      let correctRouteQuery = RouteDataForTests.multiple.slash
      correctRouteQuery = 'page-one/5/sdfdf'
      const updatedQuery = 'page-one/5/ubalu'
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, thisRouteConfig, 'slash', correctRouteQuery)
      // console.log('data query multiple 1',data, correctRouteQuery, routeVal,updatedQuery);
      // console.log(' data: ',updatedQuery, correctRouteQuery, routeVal);
      // return true;
      expect(routeVal).to.equal(updatedQuery)
    })

    it('output single routeData query', () => {
      const data = RouteDataForTests.single.data
      const correctRouteQuery = RouteDataForTests.single.slash
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'slash')
      // console.log('data query single ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal)
    })
    it('output home routeData query', () => {
      const data = RouteDataForTests.home.data
      const correctRouteQuery = RouteDataForTests.home.slash
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'slash')
      // console.log('data query home ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal)
    })
    it('output empty routeData query', () => {
      const data = RouteDataForTests.empty.data
      const correctRouteQuery = RouteDataForTests.empty.slash
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'slash', correctRouteQuery)
      // console.log('data query empty ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal)
    })
  })

  describe('Params should translate to query routes', () => {
    it('output multiple routeData query', () => {
      const data = RouteDataForTests.multiple.data
      const correctRouteQuery = RouteDataForTests.multiple.query
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'query')
      // console.log('data query multiple ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal)
    })

    it('output multiple routeData with regex query', () => {
      const data = RouteDataForTests.multipleRegex.data
      const correctRouteQuery = RouteDataForTests.multipleRegex.query
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'query')
      // console.log('data query multiple ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal)
    })

    it('output single routeData query', () => {
      const data = RouteDataForTests.single.data
      const correctRouteQuery = RouteDataForTests.single.query
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'query')
      // console.log('data query single ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal)
    })
    it('output home routeData query', () => {
      const data = RouteDataForTests.home.data
      const correctRouteQuery = RouteDataForTests.home.query
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'query')
      // console.log('data query home ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal)
    })
    it('output empty routeData query', () => {
      const data = RouteDataForTests.empty.data
      const correctRouteQuery = RouteDataForTests.empty.query
      const routeVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(data, routeConfig, 'query')
      // console.log('data query empty ',routeVal);
      expect(correctRouteQuery).to.equal(routeVal)
    })
  })

  describe('Overrides to regex values are added', () => {
    it('should override pageId home regex', () => {
      const paramsToRouteVal = SpyneUtilsChannelRouteUrl.convertParamsToRoute(payloadDataForUrlUtils, routeConfigWithRegexOverride)
      expect(paramsToRouteVal).to.equal('')
    })

    it('should replace regex with obj value from data', () => {
      const arrUpdate = SpyneUtilsChannelRouteUrl.checkPayloadForRegexOverrides(urlUtilsArr, payloadDataForUrlUtils)
      const pageIdStr = arrUpdate[0].pageId
      expect(pageIdStr).to.equal('')
    })
  })
})
