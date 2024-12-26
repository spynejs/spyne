import { DomElementTemplate } from '../../spyne/views/dom-element-template'

describe('DomElementTemplate Proxy should not exist ', () => {
  it('should not have a proxy method', () => {
    expect(DomElementTemplate.hasOwnProperty('formatTemplateForProxyData')).to.be.false
  })
})
