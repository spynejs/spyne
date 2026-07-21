import { DomElementTemplate } from '../../spyne/views/dom-element-template'
const { expect } = require('chai')

const renderFrag = (template, data) => {
  const domElTmpl = new DomElementTemplate(template, data, { testMode: true })
  return domElTmpl.renderDocFrag()
}

describe('DomElementTemplate token and section semantics', () => {
  it('{{.}} renders the current item in a string-array loop [shape-data-for-logicless-template]', () => {
    const data = { chars: ['Yoda', 'Porgi'] }
    const template = '<ul>{{#chars}}<li>{{.}}</li>{{/chars}}</ul>'
    const render = renderFrag(template, data)
    const items = render.querySelectorAll('li')
    expect(items.length).to.equal(2)
    expect(items[0].innerText).to.equal('Yoda')
    expect(items[1].innerText).to.equal('Porgi')
  })

  it('{{.*}} is an interchangeable alias of {{.}} [shape-data-for-logicless-template]', () => {
    const data = { chars: ['Yoda', 'Porgi'] }
    const dotRender = renderFrag('<ul>{{#chars}}<li>{{.}}</li>{{/chars}}</ul>', data)
    const aliasRender = renderFrag('<ul>{{#chars}}<li>{{.*}}</li>{{/chars}}</ul>', data)
    expect(aliasRender.firstElementChild.innerHTML).to.equal(dotRender.firstElementChild.innerHTML)
  })

  it('array section iterates once per item [shape-data-for-logicless-template]', () => {
    const data = { movies: [{ title: 'A New Hope' }, { title: 'The Phantom Menace' }, { title: 'Return of the Jedi' }] }
    const template = '<ul>{{#movies}}<li>{{title}}</li>{{/movies}}</ul>'
    const render = renderFrag(template, data)
    expect(render.querySelectorAll('li').length).to.equal(3)
  })

  it('absent array renders nothing [shape-data-for-logicless-template]', () => {
    const template = '<ul>{{#movies}}<li>{{title}}</li>{{/movies}}</ul>'
    const render = renderFrag(template, {})
    expect(render.querySelectorAll('li').length).to.equal(0)
  })

  it('empty array renders nothing [shape-data-for-logicless-template]', () => {
    const template = '<ul>{{#movies}}<li>{{title}}</li>{{/movies}}</ul>'
    const render = renderFrag(template, { movies: [] })
    expect(render.querySelectorAll('li').length).to.equal(0)
  })

  it('object section renders once when the object is truthy [conditional-via-object-section]', () => {
    const data = { promo: { text: 'On sale' } }
    const template = '<section>{{#promo}}<div class="promo">{{text}}</div>{{/promo}}</section>'
    const render = renderFrag(template, data)
    const promos = render.querySelectorAll('.promo')
    expect(promos.length).to.equal(1)
    expect(promos[0].innerText).to.equal('On sale')
  })

  it('absent object section renders nothing, including its wrapper tags [conditional-via-object-section]', () => {
    const template = '<section>{{#promo}}<div class="promo">{{text}}</div>{{/promo}}</section>'
    const render = renderFrag(template, {})
    expect(render.querySelectorAll('.promo').length).to.equal(0)
    expect(render.firstElementChild.innerText.trim()).to.equal('')
  })

  it('object section inside an array loop renders per item that carries the object [conditional-via-object-section]', () => {
    const data = {
      items: [
        { title: 'Alpha', eyebrow: { text: 'New' } },
        { title: 'Beta' }
      ]
    }
    const template = '<div>{{#items}}<article>{{#eyebrow}}<span class="eyebrow">{{text}}</span>{{/eyebrow}}<h2>{{title}}</h2></article>{{/items}}</div>'
    const render = renderFrag(template, data)
    const articles = render.querySelectorAll('article')
    expect(articles.length).to.equal(2)
    expect(articles[0].querySelectorAll('.eyebrow').length).to.equal(1)
    expect(articles[0].querySelector('.eyebrow').innerText).to.equal('New')
    expect(articles[1].querySelectorAll('.eyebrow').length).to.equal(0)
  })

  it('one level of nested array iteration renders inner loops per outer item [shape-data-for-logicless-template]', () => {
    const data = {
      sections: [
        { name: 'S1', tags: ['x', 'y'] },
        { name: 'S2', tags: ['z'] }
      ]
    }
    const template = '<div>{{#sections}}<section><h3>{{name}}</h3>{{#tags}}<em>{{.}}</em>{{/tags}}</section>{{/sections}}</div>'
    const render = renderFrag(template, data)
    const sections = render.querySelectorAll('section')
    expect(sections.length).to.equal(2)
    expect(sections[0].querySelectorAll('em').length).to.equal(2)
    expect(sections[1].querySelectorAll('em').length).to.equal(1)
    expect(sections[1].querySelector('em').innerText).to.equal('z')
  })

  it('attr-prefixed keys bind to element attributes [author-template-bound-surface]', () => {
    const data = { attrCtaHref: '/pricing', ctaText: 'See pricing' }
    const template = '<a class="cta" href="{{attrCtaHref}}">{{ctaText}}</a>'
    const render = renderFrag(template, data)
    const cta = render.querySelector('a.cta')
    expect(cta.getAttribute('href')).to.equal('/pricing')
    expect(cta.innerText).to.equal('See pricing')
  })

  it('renderDocFrag returns a document fragment [author-template-bound-surface]', () => {
    const render = renderFrag('<p>{{word}}</p>', { word: 'hello' })
    expect(render instanceof DocumentFragment).to.be.true
  })
})
