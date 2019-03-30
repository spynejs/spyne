import { DomItemTemplate } from '../../spyne/views/dom-item-template';
import { ScriptTemplate, StringTemplate, starWarsData } from '../mocks/template-renderer.mocks';

chai.use(require('chai-dom'));

describe('DomItemTemplate', () => {
  it('template renderer exists', () => {
    expect(DomItemTemplate).to.exist;
  });

  it('should take in a tmpl parameter', () => {
    // console.log('String template ', starWarsData);
    const re = DomItemTemplate.findTmplLoopsRE();
    const reArr = ['{{#characters}}<li>{{.*}}</li>{{/characters}}', '{{#movies}}<li>{{title}} year:{{year}}</li>{{/movies}}'];
    const tmplMatch = ScriptTemplate.innerHTML.match(DomItemTemplate.findTmplLoopsRE());
    expect(tmplMatch).to.deep.equal(reArr);
  });
});
