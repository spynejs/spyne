import { ViewStream } from '../views/view-stream.js'
import { curry } from 'ramda'
export class RouteChannelUpdater {
  constructor(cxt) {
    const name = String(cxt.props.name)
    const id = `${name}_ROUTE_UPDATER`

    const sendRouteChannelUpdate = curry(RouteChannelUpdater.createTemporaryViewStreamObj)
    return sendRouteChannelUpdate({ id, name })
  }

  static createTemporaryViewStreamObj(props, data) {
    const { name, id }  = props
    const payload = data
    const vs = new ViewStream({
      id, name, data
    })

    vs.onRendered = () => {
      vs.sendInfoToChannel('CHANNEL_ROUTE', payload)
    }

    vs.afterBroadcastEvents = () => {
      vs.disposeViewStream()
    }

    vs.appendToNull()
  }
}
