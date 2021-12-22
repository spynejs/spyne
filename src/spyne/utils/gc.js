import {forEach} from 'ramda';
export function gc() {
  let cleanup = () => {
    let loopM = m => undefined;
    forEach(loopM, this);
  };
  setTimeout(cleanup, 1);
}
