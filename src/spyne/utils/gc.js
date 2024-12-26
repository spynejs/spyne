import { forEach } from 'ramda'
export function gc() {
  const cleanup = () => {
    const loopM = m => undefined
    forEach(loopM, this)
  }
  setTimeout(cleanup, 1)
}
