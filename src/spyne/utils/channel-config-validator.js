import Validation from 'data.validation';
import * as R from 'ramda';
// import { curry, curryN, reduce, length, always } from 'ramda';
const success = Validation.Success;
const failure = Validation.Failure;
let validate = () => {};
if (R !== undefined) {
  validate = R.curry((validations, thing) => {
    const initial = success(R.curryN(R.length(validations), R.always(thing)));
    const run = (acc, v) =>
      acc.ap(v.predicate(thing) ? success(thing) : failure([v.error]));
    return R.reduce(run, initial, validations);
  });
}
export { validate };
