const {expect, assert} = require('chai');
import {ChannelPayloadToTestFilters} from '../mocks/channel-payload-data';
import {ChannelPayloadFilter} from '../../spyne/utils/channel-payload-filter';

describe('should test channel payload filters parameter configuration', () => {

  beforeEach(function() {
    // runs once before the first test in this block
    window.Spyne = {
      'config' : {
        'debug' : false
      }
    }

  });

  const testModeBool = true;




  it('should throw an error if cp filter is empty', () => {
    const cpFilter = new ChannelPayloadFilter(undefined, undefined, undefined, true);
    const {filtersAreEmpty} = cpFilter;
    expect(filtersAreEmpty).to.be.true;
  });

  it('should filter selector string only', () => {
    const cpFilter = new ChannelPayloadFilter('.my-selector');
    expect(cpFilter).to.be.a('function');
  });

  it('should filter selector string only but with testMode param', () => {
    const mySelector = '.my-selector';
    const cpFilter = new ChannelPayloadFilter(mySelector, {}, false, testModeBool);
    const {testMode, selector} = cpFilter;
    const correctVals = {
      selector: mySelector,
      testMode: testModeBool
    }
    expect({testMode, selector}).to.deep.equal(correctVals);

  });

  it('should filter selector string and testMode param in filters', () => {
    const mySelector = '.my-selector';
    const cpFilter = new ChannelPayloadFilter({selector:mySelector, testMode:testModeBool});
    const {testMode, selector} = cpFilter;
    const correctVals = {
      selector: mySelector,
      testMode: testModeBool
    }
    expect({testMode, selector}).to.deep.equal(correctVals);
  });

  it('should add debugLabel as prop in filters', () => {
    const mySelector = '.my-selector';
    const cpFilter = new ChannelPayloadFilter({debugLabel: 'myTest', testMode:testModeBool});
    const {debugLabel} = cpFilter;
    expect(debugLabel).to.equal('myTest');
  });

  it('should filter selector array only', () => {
    const mySelector = ['.my-selector', '#my-button', '#my-el.tester > li'];
    const cpFilter = new ChannelPayloadFilter(mySelector, {}, 'myTest', testModeBool);
    const {testMode, selector} = cpFilter;
    const correctVals = {
      selector: mySelector,
      testMode: testModeBool
    }
    expect({testMode, selector}).to.deep.equal(correctVals);

  });


  it('should filter selector array only as prop in filters', () => {
    const mySelector = ['.my-selector', '#my-button', '#my-el.tester > li'];
    const cpFilter = new ChannelPayloadFilter({selector:mySelector, debugLabel:'myTest', testMode: testModeBool }, 'notCorrect', false, false);
    const {selector} = cpFilter;
    expect(selector).to.equal(mySelector);

  });





});
