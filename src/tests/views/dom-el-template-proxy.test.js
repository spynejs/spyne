import { DomElementTemplate } from '../../spyne/views/dom-element-template';

// Evaluate once at the top
const isPublic = process.env.IS_PUBLIC === true;


// If not public, skip this test suite altogether
(isPublic ? describe : describe.skip)('DomElementTemplate Proxy (Public Test)', () => {
  it('should not have a proxy method', () => {
    expect(DomElementTemplate.hasOwnProperty('formatTemplateForProxyData')).to.be.false;
  });
});

(!isPublic ? describe : describe.skip)('DomElementTemplate Proxy (Internal Test)', () => {
  describe('formatTemplateForProxyData', () => {
    it('should wrap text-node placeholders like <h1>{{title}}</h1> in <spyne-cms-item>', () => {
      const input = '<h1>{{title}}</h1>';
      const output = DomElementTemplate.formatTemplateForProxyData(input);

      // wrapper exists
      expect(output).to.include('<spyne-cms-item');

      // text is preserved inside the CMS text wrapper
      expect(output).to.include(
        '<spyne-cms-item-text>{{title}}</spyne-cms-item-text>'
      );

      // structural sanity check
      expect(output).to.include('</spyne-cms-item>');
    });

    it('should NOT wrap attribute placeholders like <img src="{{imgUrl}}"> and keep them intact', () => {
      const input = '<img src="{{imgUrl}}">';
      const output = DomElementTemplate.formatTemplateForProxyData(input);

      // attributes must remain untouched
      expect(output).to.equal(input);
      expect(output).to.not.include('<spyne-cms-item');
    });

    it('should allow prefixed attr* placeholders inside attributes without CMS wrapping', () => {
      const input = '<img src="{{attrImgSrc}}" alt="{{attrImgAlt}}">';
      const output = DomElementTemplate.formatTemplateForProxyData(input);

      // attr* placeholders should remain intact
      expect(output).to.include('{{attrImgSrc}}');
      expect(output).to.include('{{attrImgAlt}}');

      // no CMS proxy tags should be injected
      expect(output).to.not.include('<spyne-cms-item');
    });

    it('should not wrap loop root elements or corrupt list structure', () => {
      const input = `
        <ul>
          {{#items}}
            <li><span>{{title}}</span></li>
          {{/items}}
        </ul>
      `;

      const data = {
        __cms__isProxy: true,
        items: [
          { title: 'A' },
          { title: 'B' },
          { title: 'C' }
        ]
      };

      const tmpl = new DomElementTemplate(input, data);
      const output = tmpl.renderToString();

      // list structure must be preserved
      expect(output.match(/<li>/g).length).to.equal(3);

      // CMS proxy should exist only around text nodes
      expect(output).to.include('<spyne-cms-item');
      expect(output).to.not.match(/data-cms-key="&lt;li/);
    });
  });
});
