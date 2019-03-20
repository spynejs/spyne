import * as R from 'ramda';
export function gc() {
  let cleanup = () => {
    let loopM = m => void 0;
    R.forEach(loopM, this);
  };
  setTimeout(cleanup, 1);
}
