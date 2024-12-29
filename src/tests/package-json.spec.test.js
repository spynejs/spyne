import { expect } from 'chai'
import pkg from '../../package.json' // Import package.json

describe('package.json export import statement', () => {
  it('should be set to "./lib/spyne.esm.js"', () => {
    const exports = pkg.exports['.']
    expect(pkg.main).to.equal('./lib/spyne.esm.js')
    expect(pkg.module).to.equal('./lib/spyne.esm.js')
    expect(exports.import).to.equal('./lib/spyne.esm.js')
    expect(exports.require).to.equal('./lib/spyne.esm.js')
  })
})
