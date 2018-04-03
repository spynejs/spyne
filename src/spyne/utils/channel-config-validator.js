import Validation from 'data.validation';
import { curry, curryN, reduce, length, always } from 'ramda';
const success = Validation.Success;
const failure = Validation.Failure;
const validate = curry((validations, thing) => {
  const initial =     success(curryN(length(validations), always(thing)));
  const run = (acc, v) =>
    acc.ap(v.predicate(thing) ? success(thing) : failure([v.error]));
  return reduce(run, initial, validations);
});
export {validate};
