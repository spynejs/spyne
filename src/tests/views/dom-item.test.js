import { DomEl } from '../../spyne/views/dom-item';

chai.use(require('chai-dom'));

const add = (a, b) => a + b;

describe('Demo', () => {
  it('should add correctly', () => {
    assert.equal(add(1, 1), 2);
  });
});

describe('DomEl', () => {
  it('dom item exists', () => {
    expect(DomEl).to.exist;
  });

  it('dom item is a dom element', () => {
    let domItem = new DomEl('h1', 'my dom element');
    let el = domItem.render();
    // assert.isFunction(domItem.click);
    expect(el).to.have.property('nodeName');
    // expect(domItem).dom.to.contain.text('my dom element');
  });
});
