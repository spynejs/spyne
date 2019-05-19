import { DomElTemplate } from '../../spyne/views/dom-el-template';
import { ScriptTemplate, StringTemplate, starWarsData } from '../mocks/template-renderer.mocks';
import {DomEl} from '../../spyne/views/dom-el-base';

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


  it('DomElTemplate show render data value', ()=>{
    let data = {cat:'meow'};
    let template = "<h1>The cat says {{cat}}";
    let domElTmpl = new DomElTemplate(template, data);
    let render = domElTmpl.renderDocFrag();
    expect(render.firstElementChild.innerText).to.equal('The cat says meow');
  });

  it('DomElTemplate Template show loop object values', ()=>{
    let data = {dog: {
        sound: 'woof'
      }};
    let template = "<h1>The dog says {{#dog}}{{sound}}{{/dog}}";
    let domElTemplate = new DomElTemplate(template, data);
    let render = domElTemplate.renderDocFrag();
    expect(render.firstElementChild.innerText).to.equal('The dog says woof');
  });

  it('DomElTemplate Template show not render null objects', ()=>{
    let data = {cat: {
        sound: 'woof'
      }};
    let template = "<article>{{#dog}}<h1>The dog says {{sound}}</h1>{{/dog}}</article>";
    let domElTemplate = new DomElTemplate(template, data);
    let render = domElTemplate.renderDocFrag();
   expect(render.firstElementChild.innerText).to.equal('');
  });

  it('DomElTemplate Template show not render null values', ()=>{
    let data = {animals: [
        { name: 'dog',
          sound:'woof'
        },
        {  name: 'cat',
          sound:'meow'
        }
      ]};
    let template = "<article>{{#animals}}<h1>The {{name}} says {{sound}}</h1>{{/animals}}</article>";
    let domElTemplate = new DomElTemplate(template, data);
    let render = domElTemplate.renderDocFrag();
    let renderStr = render.firstElementChild.querySelectorAll('h1')[1].innerText;
    expect(renderStr).to.equal('The cat says meow');
  });


});
