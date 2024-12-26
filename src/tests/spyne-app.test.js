const { expect, assert } = require('chai')
const { SpyneApp } = require('../spyne/spyne-app')

describe('should run spyne app tests', () => {
  before(() => {

    // SpyneApp.init();

  })

  it('spyne app constructor should exist', () => {
    const constructorName = SpyneApp.constructor.name
    expect(constructorName).to.equal('SpyneApplication')
    return true
  })

  it('should return warn if trying to initialize spyne application again', () => {
    const warnStr = 'The Spyne Application has already been initialized!'
    const spyneAppInit2 = SpyneApp.init({}, true)

    // console.log('second init returns string ',{spyneAppInit2, warnStr})
    expect(spyneAppInit2).to.equal(warnStr)
  })
})
