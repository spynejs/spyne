import { DomElement } from '../../spyne/views/dom-element';
chai.use(require('chai-dom'));

describe('DomEl', () => {
  it('dom item exists', () => {
    expect(DomElement).to.exist;
  });

  it('dom item is a dom element', () => {
    let domItem = new DomElement({tagName: 'h1', data: 'my dom element'});
    let el = domItem.render();
    // assert.isFunction(domItem.click);
    expect(el).to.have.property('nodeName');
    // expect(domItem).dom.to.contain.text('my dom element');
  });

});


describe("DomElRendering", ()=> {

    it('DomElement Template show render data value', ()=>{
      let data = {cat:'meow'};
      let template = "<h1>The cat says {{cat}}";
      let domEl = new DomElement({data, template});
      let render = domEl.render();
      expect(render.innerText).to.equal('The cat says meow');
    });

    it('DomElement Template show loop object values', ()=>{
      let data = {dog: {
        sound: 'woof'
        }};
      let template = "<h1>The dog says {{#dog}}{{sound}}{{/dog}}";
      let domEl = new DomElement({data, template});
      let render = domEl.render();
      expect(render.innerText).to.equal('The dog says woof');
    });

    it('DomElement Template show not render null objects', ()=>{
      let data = {cat: {
          sound: 'woof'
        }};
      let template = "<article>{{#dog}}<h1>The dog says {{sound}}</h1>{{/dog}}</article>";
      let domEl = new DomElement({data, template});
      let render = domEl.render();
      expect(render.innerText).to.equal('');
    });

    it('DomElement Template show not render null values', ()=>{
      let data = {animals: [
            { name: 'dog',
              sound:'woof'
            },
           {  name: 'cat',
              sound:'meow'
            }
        ]};
      let template = "<article>{{#animals}}<h1>The {{name}} says {{sound}}</h1>{{/animals}}</article>";
      let domEl = new DomElement({data, template});
      let render = domEl.render();
      let renderStr = render.querySelectorAll('h1')[1].innerText;
      expect(renderStr).to.equal('The cat says meow');
    });



});
