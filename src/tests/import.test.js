// creation and utility methods
import {Observable} from 'rxjs';
// operators all come from `rxjs/operators`
import { map, takeUntil, tap } from 'rxjs/operators';

describe('importing tests import.test.js', () => {
  it('works', () => {
    // throw new Error('ya!')
    console.log('loaded tests ',Observable);

    expect(true).to.be.true;
  });
});
