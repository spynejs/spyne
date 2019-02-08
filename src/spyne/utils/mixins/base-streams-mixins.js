import {ChannelsPayload} from '../../channels/channels-payload';
import {LifestreamPayload} from '../../channels/lifestream-payload';
const R = require('ramda');
//import * as Rx from "rxjs-compat";
import {Observable} from "rxjs";

export function baseStreamsMixins() {
  return {
    testFunc: function(str) {
      console.log('stream mixin is ', str);
    },
    sendRoutePayload: function(obs, data) {
      return new ChannelsPayload('ROUTE', obs, data, 'subscribe');
    },
    sendUIPayload: function(obs, data) {
      return new ChannelsPayload('UI', obs, data, 'subscribe');
    },
    sendChannelPayload: function(channelName, payload) {
      const getProp = str => R.prop(str, this.props);
      const channel = channelName;
      let srcElement = {
        cid: getProp('cid'),
        el: getProp('el'),
        viewName: getProp('name')
      };
      let data = {
        payload, channel, srcElement
      };

      return new ChannelsPayload(channelName, new Observable.of(''), data,
        'subscribe');
    },
    sendLifeStreamPayload: function(obs, data) {
      return new ChannelsPayload('LIFESTREAM', obs, data, 'subscribe');
    },

    createLifeStreamPayload: function(STEP, data = {}, type = 'parent') {
      let viewId = `${this.props.name}: ${this.props.cid}`;
      return new LifestreamPayload('LIFESTREAM', STEP, type, viewId, data).data;
    }
  };
}
