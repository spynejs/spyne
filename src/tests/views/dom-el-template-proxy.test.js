import { DomElementTemplate } from '../../spyne/views/dom-element-template';

// Evaluate once at the top
const isPublic = process.env.IS_PUBLIC === true;

console.log("IS PUBLIC ",isPublic);


// If not public, skip this test suite altogether
(isPublic ? describe : describe.skip)('DomElementTemplate Proxy (Public Test)', () => {
  it('should not have a proxy method', () => {
    expect(DomElementTemplate.hasOwnProperty('formatTemplateForProxyData')).to.be.false;
  });
});
