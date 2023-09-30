import { DomElementTemplate } from '../../spyne/views/dom-element-template';
import { ScriptTemplate, StringTemplate, starWarsData } from '../mocks/template-renderer.mocks';
import {DomElement} from '../../spyne/views/dom-element';

chai.use(require('chai-dom'));

describe('DomElTemplate', () => {
  it('template renderer exists', () => {
    expect(DomElementTemplate).to.exist;
  });

  it('should take in a tmpl parameter', () => {
    // console.log('String template ', starWarsData);
    const re = DomElementTemplate.findTmplLoopsRE();
    const reArr = ['{{#characters}}<li>{{.*}}</li>{{/characters}}', '{{#movies}}<li>{{title}} year:{{year}}</li>{{/movies}}'];
    const tmplMatch = ScriptTemplate.innerHTML.match(DomElementTemplate.findTmplLoopsRE());
    expect(tmplMatch).to.deep.equal(reArr);
  });


  it('DomElementTemplate show render data value', ()=>{
    let data = {cat:'meow'};
    let template = "<h1>The cat says {{cat}}";
    let domElTmpl = new DomElementTemplate(template, data);
    let render = domElTmpl.renderDocFrag();
    //console.log("RENDER IS ",render.firstElementChild);
    expect(render.firstElementChild.innerText).to.equal('The cat says meow');
  });

  it('DomElementTemplate Template show loop object values', ()=>{
    let data = {dog: {
        sound: 'woof'
      }};
    let template = "<h1>The dog says {{#dog}}{{sound}}{{/dog}}</h1>";
    let domElTemplate = new DomElementTemplate(template, data);
    let render = domElTemplate.renderDocFrag();
    expect(render.firstElementChild.innerText).to.equal('The dog says woof');
  });

  it('DomElementTemplate Template show not render null objects', ()=>{
    let data = {cat: {
        sound: 'woof'
      }};
    let template = "<article>{{#dog}}<h1>The dog says {{sound}}</h1>{{/dog}}</article>";
    let domElTemplate = new DomElementTemplate(template, data);
    let render = domElTemplate.renderDocFrag();
   expect(render.firstElementChild.innerText).to.equal('');
  });

  it('DomElementTemplate Template show not render null values', ()=>{
    let data = {animals: [
        { name: 'dog',
          sound:'woof'
        },
        {  name: 'cat',
          sound:'meow'
        }
      ]};
    let template = "<article>{{#animals}}<h1>The {{name}} says {{sound}}</h1>{{/animals}}</article>";
    let domElTemplate = new DomElementTemplate(template, data);
    let render = domElTemplate.renderDocFrag();
    let renderStr = render.firstElementChild.querySelectorAll('h1')[1].innerText;
    expect(renderStr).to.equal('The cat says meow');
  });


  it('DomElementTemplate Template renders array of objects', ()=>{
    let data =[
      {name: 'jane'},
      {name: 'joe'},
      {name: 'john'}
    ];
    let template = "<ul>{{#}}<li>Welcome, {{name}}.</li>{{/}}</ul>";
    let domElTemplate = new DomElementTemplate(template, data);
    let render = domElTemplate.renderDocFrag();
    let lastItemTxt = render.firstElementChild.querySelectorAll('li')[2].innerText
    expect(lastItemTxt).to.equal('Welcome, john.');
  });

  it('DomElementTemplate Template renders array of objects and also nested objects', ()=>{
    let data =[
      {name: 'jane', hobbies: ['photography','driving','running']},
      {name: 'joe',  hobbies: []},
      {name: 'john', hobbies: ['vlogging','dancing'] }
    ];
    let template = "<ul>{{#}}<li>Welcome, {{name}}. and hobbies are {{hobbies}} </li>{{/}}</ul>";
   // let template = "<ul>{{#}}<li>Welcome, {{name}}. <ol>{{#hobbies}}<li>{{.}}</li><{{/hobbies}}/ol></li>{{/}}</ul>";
    let domElTemplate = new DomElementTemplate(template, data);
    let render = domElTemplate.renderDocFrag();

    //console.log("render nested obj ",render.firstElementChild);
    //let lastItemTxt = render.firstElementChild.querySelectorAll('li')[2].innerText
   // expect(lastItemTxt).to.equal('Welcome, john.');
    return true;
  });
  it('DomElementTemplate  renders object and loops arrays', ()=>{
    let data =[
      {name: 'jane', hobbies: ['photography','driving','running'], favFoods: ['hummus', 'quinoa', 'burritos']},
      {name: 'joe',  hobbies: []},
      {name: 'john', hobbies: ['vlogging','dancing'] }
    ];
    let template = "<ul><li>Welcome, {{name}}. Your hobbies are {{#hobbies}}{{.}}, {{/hobbies}}and favorite foods are {{#favFoods}}<span>{{.}}, </span>{{/favFoods}} </li></ul>";
    data = data[0];
    let domElTemplate = new DomElementTemplate(template, data);
    let render = domElTemplate.renderDocFrag();
    let favFoodInnerText = render.firstElementChild.querySelectorAll('span')[0].innerText
    expect(favFoodInnerText).to.equal('hummus, ');
  });

  it('DomElementTemplate  renders objectt and loops array and loops obj params', ()=>{
    let data =[
      {name: 'jane', hobbies: ['photography','driving','running'], details: {hair:'brown', eyes:'hazel'}},
      {name: 'joe',  hobbies: []},
      {name: 'john', hobbies: ['vlogging','dancing'] }
    ];
    let template = "<ul><li>Welcome, {{name}}. Your hobbies are {{#hobbies}}{{.}}, {{/hobbies}}and your {{#details}}hair is {{hair}} and your eyes are {{eyes}} {{/details}}and favorite foods are {{#favFoods}}<span>{{.}}, </span>{{/favFoods}} </li></ul>";
    data = data[0];
    let domElTemplate = new DomElementTemplate(template, data);
    let render = domElTemplate.renderDocFrag();
    let favFoodInnerText = render.firstElementChild

    //console.log("render obj w looped arr ", favFoodInnerText);
    return true;
  });


  it('DomElementTemplate Template renders array of nested objects and uses dot syntax', ()=>{
    let data ={
      users: [
      {name: 'jane', details: {age:24, hair: 'brown', education: {school:'nyu', degree:'Philosophy'}  }},
      {name: 'joe',  details: {age:34, hair: 'blonde', education: {school:'nyu', degree:'Computer Science'}   }},
      {name: 'john', details: {age:54, hair: 'green', education: {school:'nyu', degree:'Math'}   }}
      ]
    };
    let template = "<ul>{{#users}}<li>Welcome, {{name}}. and details are {{details.age}} and degree is {{details.education.degree}} </li>{{/users}}</ul>";
    // let template = "<ul>{{#}}<li>Welcome, {{name}}. <ol>{{#hobbies}}<li>{{.}}</li><{{/hobbies}}/ol></li>{{/}}</ul>";
    let domElTemplate = new DomElementTemplate(template, data);
    let render = domElTemplate.renderDocFrag();

    //console.log("render nested array of objs ",render.firstElementChild);
    //let lastItemTxt = render.firstElementChild.querySelectorAll('li')[2].innerText
    // expect(lastItemTxt).to.equal('Welcome, john.');
    return true;
  });

  it('DomElementTemplate Template renders dot syntax of non looping object', ()=>{
    let data ={
      users: [
        {name: 'jane', details: {age:24, hair: 'brown', education: {school:'nyu', degree:'Philosophy'}  }},
        {name: 'joe',  details: {age:34, hair: 'blonde' }},
        {name: 'john', details: {age:54, hair: 'green'  }}
      ]
    };
    data = data.users[0];
    let template = "<ul><li>Welcome, {{name}}. and age is {{details.age}} and graduated from {{details.education.school}} </li></ul>";
    // let template = "<ul>{{#}}<li>Welcome, {{name}}. <ol>{{#hobbies}}<li>{{.}}</li><{{/hobbies}}/ol></li>{{/}}</ul>";
    let domElTemplate = new DomElementTemplate(template, data);
    let render = domElTemplate.renderDocFrag();

    //console.log("render nested obj ",render.firstElementChild);
    //let lastItemTxt = render.firstElementChild.querySelectorAll('li')[2].innerText
    // expect(lastItemTxt).to.equal('Welcome, john.');
    return true;
  });

  it('DomElementTemplate should render index string value of an array',() =>{
    const article = ["Usu at illum porro audire. Nam at ubique latine, vidit ocurreret pri ea, cu elitr nonumes mediocritatem nam.",
      "Eu delenit meliore graecis sea. Sit id ubique commune, ius ne recusabo oportere similique, error putant usu ei.",
      "Nam mutat saperet detracto eu, te ubique utamur aliquando pro. Ut verear probatus sea. Porro sonet euripidis ex est.",
      "Mucius platonem eu per. Te utroque persecuti pro, error verterem scribentur no est.",
      "An pro nibh salutatus, ea rebum aeterno complectitur has."];

    const template = `<li>{{article.1}}</li>`;
    const data = {article};
    const domElTemplate = new DomElementTemplate(template, data);

    const result = domElTemplate.renderToString();

    expect(result).to.eq("<li>Eu delenit meliore graecis sea. Sit id ubique commune, ius ne recusabo oportere similique, error putant usu ei.</li>");

  })



});
