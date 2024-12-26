import { expect } from 'chai'
import pkg from '../../package.json' // Import package.json

describe('package.json export import statement', () => {
  it('should be set to "./lib/spyne.esm.js"', () => {
    const exports = pkg.exports['.']
    expect(exports.import).to.equal('./lib/spyne.esm.js')
  })
})
