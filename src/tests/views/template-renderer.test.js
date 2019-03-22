import { DomTemplateRenderer } from '../../spyne/views/dom-template-renderer';
import { ScriptTemplate, StringTemplate, starWarsData } from '../mocks/template-renderer.mocks';

chai.use(require('chai-dom'));

describe('DomTemplateRenderer', () => {
  it('template renderer exists', () => {
    expect(DomTemplateRenderer).to.exist;
  });

  it('should take in a tmpl parameter', () => {
    // console.log('String template ', starWarsData);
    const re = DomTemplateRenderer.findTmplLoopsRE();
    const reArr = ['{{#characters}}<li>{{.*}}</li>{{/characters}}', '{{#movies}}<li>{{title}} year:{{year}}</li>{{/movies}}'];
    const tmplMatch = ScriptTemplate.innerHTML.match(DomTemplateRenderer.findTmplLoopsRE());
    expect(tmplMatch).to.deep.equal(reArr);
  });
});
