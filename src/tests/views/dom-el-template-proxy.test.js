import { DomElementTemplate } from '../../spyne/views/dom-element-template';

describe('DomElementTemplate (Public)', () => {
  it('does not expose CMS proxy functionality', () => {
    expect(
        Object.prototype.hasOwnProperty.call(
            DomElementTemplate,
            'formatTemplateForProxyData'
        )
    ).to.be.false;
  });
});
