import { DomElement } from '../../spyne/views/dom-element'
chai.use(require('chai-dom'))

describe('DomEl', () => {
  it('dom item exists', () => {
    expect(DomElement).to.exist
  })

  it('dom item is a dom element', () => {
    const domItem = new DomElement({ tagName: 'h1', data: 'my dom element' })
    const el = domItem.render()
    // assert.isFunction(domItem.click);
    expect(el).to.have.property('nodeName')
    // expect(domItem).dom.to.contain.text('my dom element');
  })
})

describe('DomElRendering', () => {
  it('DomElement Template show render data value', () => {
    const data = { cat:'meow' }
    const template = '<h1>The cat says {{cat}}'
    const domEl = new DomElement({ data, template })
    const render = domEl.render()
    expect(render.innerText).to.equal('The cat says meow')
  })

  it('DomElement Template show loop object values', () => {
    const data = {
      dog: {
        sound: 'woof'
      }
    }
    const template = '<h1>The dog says {{#dog}}{{sound}}{{/dog}}'
    const domEl = new DomElement({ data, template })
    const render = domEl.render()
    expect(render.innerText).to.equal('The dog says woof')
  })

  it('DomElement Template show not render null objects', () => {
    const data = {
      cat: {
        sound: 'woof'
      }
    }
    const template = '<article>{{#dog}}<h1>The dog says {{sound}}</h1>{{/dog}}</article>'
    const domEl = new DomElement({ data, template })
    const render = domEl.render()
    expect(render.innerText).to.equal('')
  })

  it('DomElement Template show not render null values', () => {
    const data = {
      animals: [
        {
          name: 'dog',
          sound:'woof'
        },
        {
          name: 'cat',
          sound:'meow'
        }
      ]
    }
    const template = '<article>{{#animals}}<h1>The {{name}} says {{sound}}</h1>{{/animals}}</article>'
    const domEl = new DomElement({ data, template })
    const render = domEl.render()
    const renderStr = render.querySelectorAll('h1')[1].innerText
    expect(renderStr).to.equal('The cat says meow')
  })
})
