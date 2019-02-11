//import * as Rx from "rxjs-compat";
import {Subject} from "rxjs";
import { filter, map } from 'rxjs/operators';

const R = require('ramda');
export class LifecyleObservables {
  constructor(props) {
    this.props.observableStreams = LifecyleObservables.createDirectionalObservables();
  }

  static createDirectionalFiltersObject() {
    const dirInternal = 'internal';
    const dirParent = 'parent';
    const dirChild = 'child';
    return {
      P: [dirParent],
      C: [dirChild],
      PCI: [dirParent, dirInternal, dirChild],
      CI: [dirChild, dirInternal],
      PI: [dirParent, dirInternal],
      PC: [dirParent, dirChild]
    };
  }

  static addDefaultDir(obj) {
    const defaults = R.flip(R.merge);
    return defaults({$dir:['internal']}, R.clone(obj));
  }

  static addDownInternalDir(obj, arr = ['internal', 'down']) {
    const defaults = R.flip(R.merge);
    return defaults(R.clone(obj), {$dir:arr});
  }

  static addChildAndInternalDir(obj, arr = ['child', 'down']) {
    const defaults = R.flip(R.merge);
    return defaults(R.clone(obj), {$dir:arr});
  }

  static mapToDefaultDir(p) {
    return this.addDefaultDir(p);
  }

  static createDirectionalObservables(obs$ = new Subject(), viewName, cid) {
    if (viewName!==undefined && cid !==undefined){
      obs$['viewName']=viewName;
      obs$['cid']=cid;
    }

    const filterStreams = val => R.propSatisfies(arrType => arrType.includes(val), '$dir');
    const filterParent = filterStreams('parent');
    const filterChild = filterStreams('child');
    const filterInternal = filterStreams('internal');

    const addfrom$ = relStr => R.merge({from$:relStr});
    const addParentfrom$ = addfrom$('child');
    const addInternalfrom$ = addfrom$('internal');
    const addChildfrom$ = addfrom$('parent');

    const raw$ =  obs$
      .pipe(filter((payload) => payload !== undefined && payload.action !== undefined));
    // .filter(p => p.$dir !== undefined)
    // .do(p => console.log('payload : ', p.$dir, p));
    const toInternal$ = obs$.pipe(filter(filterInternal), map(addInternalfrom$));
    const toParent$ = obs$.pipe(filter(filterParent), map(addParentfrom$));
    const toChild$ = obs$.pipe(filter(filterChild), map(addChildfrom$));
    // const upObs$ = obs$.do(p => console.log('UP: ', p));
    const streamObj = {
      parent: toParent$,
      internal: toInternal$,
      child: toChild$
    };

    const completeStream = (arr = []) => {
      const endStream = o => {
        o.complete();
        o.isStopped = true;
      };

      const setCompleteStream = (str) => {
        if (streamObj[str] !== undefined) {
          let obs$ = streamObj[str];
          endStream(obs$);
        }
      };

      if (arr !== undefined && arr.length >= 1) {
        arr.forEach(setCompleteStream);
      }
    };
    const completeAll = () => {
      let completeStream = o => {
        o.complete();
        o.isStopped = true;
      };
      R.forEach(completeStream, [raw$, toInternal$, toParent$, toChild$]);
    };

    return {
      raw$, toInternal$, toParent$, toChild$, completeAll, completeStream
    };
  }
}
