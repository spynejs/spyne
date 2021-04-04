const {expect, assert} = require('chai');
const SpynePlugin = require('../spyne/spyne-plugins');


describe('should test use of spyne plugin', () => {

  it('spyne plugin should exist', () => {
    console.log('spyne plugin  is ',SpynePlugin);
   expect(SpynePlugin).to.exist;

  });

});
