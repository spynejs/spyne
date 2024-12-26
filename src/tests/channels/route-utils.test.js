// const assert = require('assert');

import { SpyneUtilsChannelRoute } from '../../spyne/utils/spyne-utils-channel-route'
import { postProcessedRouteData, preProcessedRouteData, reduceProcessedRouteData, reducedRoutesArr, mainConfigPreProcessedData, mainConfigPostProcessedData } from '../mocks/routes-data'
import {
  SpyneConfigData,
  RouteDataForTests,
  windowLocationData
} from '../mocks/utils-data'
import { SpyneChannelRoute } from '../../spyne/channels/spyne-channel-route'
import { path } from 'ramda'
const R = require('ramda')
const ObjtoStr = JSON.stringify

const routeConfig = SpyneConfigData.channels.ROUTE

describe('Route Utils', () => {
  it('flattenConfigObjects should return array of params', () => {
    const finalArr = ['pageId', '', 'imageNum', 'author', 'hemingway', 'author', 'hemingway', 'imageNum', 'pixels', 'photogNum', 'randomNum', '32', 'holographs|photos|digital|videos']
    const arr = SpyneUtilsChannelRoute.flattenConfigObject(routeConfig.routes)
    // return true;
    expect(arr).to.deep.equal(finalArr)
  })

  it('get route arr data should remove unused params', () => {
    const paramsArr = ['pageId', '', 'imageNum', 'author', 'photogNum']
    const arr = ['imageNum', 'pageId', 'author']
    const routedArr = ['pageId', 'imageNum', 'author']
    const routeObj = SpyneUtilsChannelRoute.getRouteArrData(arr, paramsArr)
    expect(routeObj.paths).to.deep.equal(routedArr)
  })
})

describe('it should compare two objects for updated keys', () => {
  const obj1 = {
    pageId: 'guide',
    section: 'reference'
  }

  const obj2 = {
    pageId: 'guide',
    section: 'overview',
    menuItem: 'intro-sending-channel-payloads',
    type: 'menuItem',
    isManualScroll: true
  }

  const obj3 = {
    ya: 1,
    ubu:3,
    lsd:4,
    aesf:'sadfsd',
    a23rff: 23,
    aasdsf: 234
  }

  const routeKeywordsArr = [
    'pageId',
    'section',
    'menuItem'
  ]

  const checkUpdatedKeys = SpyneUtilsChannelRoute.compareRouteKeywords()

  it('first comparison should be done against empty obj', () => {
    const compareStart = checkUpdatedKeys.compare(obj1)
    // console.log('compare start is ', compareStart)
    expect(compareStart.pathsChanged).to.deep.equal(['pageId', 'section'])
  })

  it('should compare second obj against first', () => {
    const compare2 = checkUpdatedKeys.compare(obj2, routeKeywordsArr)
    expect(compare2.pathsChanged).to.deep.equal(['section', 'menuItem'])
  })

  it('should conform empty str and and 404s, convert arrays to route config', () => {
    const revisedConfig = SpyneUtilsChannelRoute.conformRouteObject(preProcessedRouteData)
    expect(revisedConfig).to.deep.equal(postProcessedRouteData)
  })

  it('should create route datasets ', () => {
    const channelsRouteObj = R.prop('routes', postProcessedRouteData)

    channelsRouteObj.routePath['bio-.*'] = {
      routePath : {
        404 : '.+',
        routeName : 'bioId',
        bioLastName : '.*'
      }
    }

    const routeDatasetsAndProps = SpyneUtilsChannelRoute.addRouteDatasets(postProcessedRouteData)

    const { routeDatasetsArr } = routeDatasetsAndProps
    const { routeNamesArr } = routeDatasetsAndProps

    // console.log(routeNamesArr,' route data sets \n',JSON.stringify(routeDatasetsArr) );
    // return true;
    expect(routeDatasetsArr).to.deep.equal(reducedRoutesArr)
  })
})
