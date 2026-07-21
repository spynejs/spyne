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
    const domEl = new DomElement({ data, template }, true)
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
    const domEl = new DomElement({ data, template }, true)
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
    const domEl = new DomElement({ data, template }, true)
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
    const domEl = new DomElement({ data, template }, true)
    const render = domEl.render()
    const renderStr = render.querySelectorAll('h1')[1].innerText
    expect(renderStr).to.equal('The cat says meow')
  })
})

describe('DomElAdoption', () => {
  const createAdoptableEl = () => {
    const el = document.createElement('dd')
    el.id = 'adopted-test-el'
    el.className = 'adopted-class'
    el.dataset.customFlag = 'kept'
    el.innerHTML = '<label onclickish="fake">inner content</label>'
    document.body.appendChild(el)
    return el
  }

  const removeIfPresent = (el) => {
    if (el !== undefined && el.isConnected === true) {
      el.remove()
    }
  }

  it('adoption leaves the element byte-identical (no attribute pipeline)', () => {
    const el = createAdoptableEl()
    const before = el.outerHTML
    const domEl = new DomElement({ el })
    expect(domEl.props.adopted).to.equal(true)
    expect(el.outerHTML).to.equal(before)
    removeIfPresent(el)
  })

  it('render() on adopted element is idempotent and returns the same node', () => {
    const el = createAdoptableEl()
    const domEl = new DomElement({ el })
    const first = domEl.render()
    const second = domEl.render()
    expect(first).to.equal(el)
    expect(second).to.equal(el)
    removeIfPresent(el)
  })

  it('unmount() removes the adopted element from the document', () => {
    const el = createAdoptableEl()
    const domEl = new DomElement({ el })
    expect(el.isConnected).to.equal(true)
    domEl.unmount()
    expect(el.isConnected).to.equal(false)
    expect(document.getElementById('adopted-test-el')).to.equal(null)
  })

  it('second unmount() is a safe no-op', () => {
    const el = createAdoptableEl()
    const domEl = new DomElement({ el })
    domEl.unmount()
    const secondUnmount = () => domEl.unmount()
    expect(secondUnmount).to.not.throw()
  })

  it('add*AndRender mutation calls are inert on adopted elements', () => {
    const el = createAdoptableEl()
    const before = el.outerHTML
    const domEl = new DomElement({ el })
    domEl.addTemplateAndRender('<h1>{{nope}}</h1>')
    domEl.addDataAndRender({ nope: 'should not appear' })
    expect(el.outerHTML).to.equal(before)
    removeIfPresent(el)
  })

  it('rendered path regression: render then unmount still removes the element', () => {
    const domEl = new DomElement({ tagName: 'h2', data: 'rendered path' })
    const el = domEl.render()
    document.body.appendChild(el)
    expect(el.isConnected).to.equal(true)
    domEl.unmount()
    expect(el.isConnected).to.equal(false)
  })
})
