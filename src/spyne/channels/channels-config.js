import { SpyneAppProperties } from '../utils/spyne-app-properties.js'
import { compose, path, is } from 'ramda'
import { Observable, Subject } from 'rxjs'

// console.log('channels config loaded ',R,Rx);
const registeredStreamNames = () => ({
  includes:  () => SpyneAppProperties.initialized === true ? SpyneAppProperties.listRegisteredChannels() : ['CHANNEL_ROUTE', 'CHANNEL_UI', 'CHANNEL_WINDOW', 'DISPATCHER']

})

// getGlobalObj().channelsListArr;
const registeredSteps = ['LOAD', 'RENDER', 'MOUNT', 'UNMOUNT', 'DISPOSE', 'GARBAGE_COLLECT', 'UPDATE']
const registeredLifeStreamTypes = ['parent', 'self', 'child', 'children', 'view']
const registeredStreamTypes = ['Observable', 'BehaviorSubject', 'Subject', 'Observer', 'Subscriber', 'FromEventObservable']
const registeredActions = ['subscribe', 'combineLatest']
const getRxType = (obs) => obs().constructor.name
// let getObservableType = (obs) => obs.constructor.name;
const confirmObservable = (obs) => obs.subscribe !== undefined
// let pullMainRoute = (str) => str.replace(/^(\/?)(.*)(\/)(.*)/g, '$2');
let baseValidations = []; let viewInfoValidations = []; let uiValidations = []
let lifestreamValidations = []; let stepValidations = []; let stepDisposeValidations = []; let stepUpdateValidations = []
let routeValidations = []; let StreamsConfig = []

if (compose !== undefined && Observable !== undefined) {
//  ===========================================================================
  // ALL VALIDATIONS ADD THE BASE VALIDATIONS THROUGH CONCATENATION
  //  ===========================================================================
  baseValidations = [
    {
      error: `need to match a valid name within ${registeredStreamTypes}`,
      predicate: payload => registeredStreamNames().includes(payload.name)
    },

    {
      error: 'param \'observable\' must contain a valid Observable',
      // predicate: payload => registeredStreamTypes.includes(getObservableType(payload.observable))
      predicate: payload => confirmObservable(payload.observable)
    },
    {
      error: 'param action must be a registered action',
      predicate: payload => registeredActions.includes(payload.action)
    }

  ]
  //  ===========================================================================
  // THESE VALIDATIONS ARE CONCATENATED WHEN THE OBSERVABLE REFERS TO A VIEW
  //  ===========================================================================
  viewInfoValidations = [
    {
      error: 'needs vsid number in srcElement',
      predicate: compose(is(String), path(['data', 'srcElement', 'vsid']))
    },
    {
      error: 'needs a id in srcElement',
      predicate: compose(is(String),
        path(['data', 'srcElement', 'id']))
    }
  ]

  //  ===========================================================================
  // NO SPECIFIC UI VALIDATIONS AT THIS TIME -- IT JUST ADD OTHERS
  //  ===========================================================================
  uiValidations = function() {
    const uiValidations = []
    return uiValidations.concat(baseValidations).concat(viewInfoValidations)
  }
  //  ===========================================================================
  // NO SPECIFIC LIFESTREAM VALIDATIONS AT THIS TIME -- IT JUST ADD OTHERS
  const lifeStreamValidations = [

    {
      error: `need to match a valid name within ${registeredStreamTypes}`,
      predicate: payload => registeredStreamNames().includes(payload.name)
    },

    {
      error: `needs one of the following step strings: ${registeredSteps}`,
      predicate: payload => registeredSteps.includes(payload.STEP)
    },
    {
      error: `type needs to one of the following: ${registeredLifeStreamTypes}`,
      predicate: payload => registeredLifeStreamTypes.includes(payload.type)
    },

    {
      error: 'viewId needs to be added ',
      predicate: payload => payload.viewId !== undefined
    }
  ]

  stepValidations = function() {
    const stepValidations = []
    return stepValidations.concat(lifeStreamValidations)
  }

  stepDisposeValidations = function() {
    const stepUpdateValidations = [
      {
        error: 'DISPOSE STEP requires a disposeItem param in the data object',
        predicate: payload => payload.STEP === 'DISPOSE' &&
            payload.data.disposeItems !== undefined
      }
    ]
    return stepUpdateValidations.concat(lifeStreamValidations)
  }

  stepUpdateValidations = function() {
    const stepUpdateValidations = [
      {
        error: 'UPDATE STEP requires a data object ',
        predicate: payload => payload.STEP === 'UPDATE' && payload.data !==
            undefined
      }
    ]
    return stepUpdateValidations.concat(lifeStreamValidations)
  }
  //  ===========================================================================
  // lifestreamValidations
  //  ===========================================================================
  lifestreamValidations = function() {
    return lifeStreamValidations.concat(baseValidations)
      .concat(viewInfoValidations)
  }
  //  ===========================================================================
  // HERE IS THE ROUTE VALIDATIONS
  //  ===========================================================================
  routeValidations = function() {
    const routeValidations = [
      /*
      *
      {
          error: `needs a valid route string within [${registeredRoutes}]`,
          predicate: payload => registeredRoutes.includes(pullMainRoute(payload.data.navigateTo))
      }
      *
      */

    ]
    return routeValidations.concat(baseValidations).concat(viewInfoValidations)
  }
  //  ===========================================================================
  /*
  * THE IDEA OF StreamsConfig IS TO COMPLETELY GENERATE ALL APP STREAMS USING THIS OBJECT
  * THIS HAS NOT BEEN IMPLEMENTED -- MAY BE ADDED IN A FUTURE VERSION
  */
  //  ===========================================================================
  StreamsConfig = function() {
    const streamValidations = [
      {
        error: 'param \'name\' must be of a registered type',
        predicate: payload => registeredStreamNames().includes(payload.name)
      },
      {
        error: 'param \'observable\' must contain a valid Observable',
        predicate: payload => registeredStreamTypes.includes(
          getRxType(payload.observable))
      },
      {
        error: 'param action must be a registered action',
        predicate: payload => registeredActions.includes(payload.action)
      }

    ]

    return {
      streams: [
        {
          init: {
            name: 'DISPATCHER',
            observable: () => new Subject(),
            action: 'subscribe'
          },
          structure: {
            type: String,
            observable: Observable || Subject,
            action: String
          },
          validations: streamValidations
        },
        {
          init: {
            name: 'UBU',
            observable: () => new Subject(),
            action: 'subscribe'
          },
          structure: {
            type: String,
            observable: Observable || Subject,
            action: String
          },
          validations: streamValidations
        }
      ]
    }
  }
}
export {
  stepDisposeValidations, stepUpdateValidations, stepValidations, uiValidations, routeValidations, lifestreamValidations, registeredStreamNames, StreamsConfig
}
