import { expect } from 'chai';
import pkg from '../../package.json'; // Import package.json

const isPublic = process.env.IS_PUBLIC === true;

describe('package.json export import statement', () => {
  it('should be set to "./lib/spyne.esm.js"', () => {
    const exports = pkg.exports['.'];
    expect(pkg.main).to.equal('./lib/spyne.esm.js');
    expect(pkg.module).to.equal('./lib/spyne.esm.js');
    expect(exports.import).to.equal('./lib/spyne.esm.js');
    expect(exports.require).to.equal('./lib/spyne.esm.js');
  });
});

(isPublic ? describe : describe.skip)('license should be LGPL', () => {
  it('should have LGPL as license', () => {
    expect(pkg.license).to.equal('LGPL');
  });
});
