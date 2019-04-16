import { DomElTemplate } from '../../spyne/views/dom-item-template';
import { ScriptTemplate, StringTemplate, starWarsData } from '../mocks/template-renderer.mocks';

chai.use(require('chai-dom'));

describe('DomElTemplate', () => {
  it('template renderer exists', () => {
    expect(DomElTemplate).to.exist;
  });

  it('should take in a tmpl parameter', () => {
    // console.log('String template ', starWarsData);
    const re = DomElTemplate.findTmplLoopsRE();
    const reArr = ['{{#characters}}<li>{{.*}}</li>{{/characters}}', '{{#movies}}<li>{{title}} year:{{year}}</li>{{/movies}}'];
    const tmplMatch = ScriptTemplate.innerHTML.match(DomElTemplate.findTmplLoopsRE());
    expect(tmplMatch).to.deep.equal(reArr);
  });
});
