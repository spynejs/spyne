const { expect } = require('chai')
import { ViewStreamSelector } from '../../spyne/views/view-stream-selector'

describe('ViewStreamSelector', () => {
  let container

  const el$ = (sel) => ViewStreamSelector(container, sel)

  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML =
      '<ul>' +
      '<li class="item">A</li>' +
      '<li class="item">A</li>' +
      '<li class="item special">C</li>' +
      '</ul>' +
      '<p class="solo">only</p>'
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  describe('el (always a single element)', () => {
    it('should return the element for a single match', () => {
      const el = el$('.solo').el
      expect(el.nodeType).to.equal(1)
      expect(el.textContent).to.equal('only')
    })

    it('should return the first element for multiple matches', () => {
      const el = el$('.item').el
      expect(el.nodeType).to.equal(1)
      expect(el.textContent).to.equal('A')
    })

    it('should return null for no matches, mirroring querySelector', () => {
      expect(el$('.nope').el).to.equal(null)
    })

    it('should support direct element methods on multi-match selectors', () => {
      el$('.item').el.setAttribute('data-first', 'true')
      const items = container.querySelectorAll('.item')
      expect(items[0].dataset.first).to.equal('true')
      expect(items[1].dataset.first).to.be.undefined
    })
  })

  describe('els (always an Array)', () => {
    it('should return an Array for multiple matches', () => {
      const els = el$('.item').els
      expect(Array.isArray(els)).to.be.true
      expect(els).to.have.length(3)
    })

    it('should return a single-item Array for one match', () => {
      const els = el$('.solo').els
      expect(Array.isArray(els)).to.be.true
      expect(els).to.have.length(1)
    })

    it('should return an empty Array for no matches', () => {
      const els = el$('.nope').els
      expect(Array.isArray(els)).to.be.true
      expect(els).to.have.length(0)
    })

    it('should support Array methods directly', () => {
      const texts = el$('.item').els.map(el => el.textContent)
      expect(texts).to.deep.equal(['A', 'A', 'C'])
    })

    it('should keep arr as an equivalent legacy alias', () => {
      expect(el$('.item').arr).to.deep.equal(el$('.item').els)
      expect(Array.isArray(el$('.item').arr)).to.be.true
    })
  })

  describe('length and len', () => {
    it('should return the match count from length', () => {
      expect(el$('.item').length).to.equal(3)
      expect(el$('.solo').length).to.equal(1)
      expect(el$('.nope').length).to.equal(0)
    })

    it('should keep len in agreement with length', () => {
      expect(el$('.item').len).to.equal(el$('.item').length)
    })
  })

  describe('chainability', () => {
    it('should chain class mutators', () => {
      el$('.item').addClass('x').toggleClass('y', true).removeClass('x')

      const item = container.querySelector('.item')
      expect(item.classList.contains('y')).to.be.true
      expect(item.classList.contains('x')).to.be.false
    })

    it('should return the selector from mutators', () => {
      const s = el$('.item')
      expect(s.addClass('z')).to.equal(s)
      expect(s.toggleClass('z')).to.equal(s)
      expect(s.setClass('q')).to.equal(s)
      expect(s.setActiveItem('active', '.special')).to.equal(s)
    })
  })

  describe('appendChild', () => {
    it('should append to the first element on a multi-match selector', () => {
      const span = document.createElement('span')
      span.className = 'appended'

      el$('.item').appendChild(span)

      const items = container.querySelectorAll('.item')
      expect(items[0].querySelector('.appended')).to.not.be.null
      expect(items[1].querySelector('.appended')).to.be.null
    })

    it('should warn and not throw on a non-matching selector', () => {
      expect(() => el$('.nope').appendChild(document.createElement('b'))).to.not.throw()
    })
  })

  describe('setActiveItem', () => {
    it('should activate only the exact matching node', () => {
      el$('.item').setActiveItem('active', '.special')

      const items = container.querySelectorAll('.item')
      expect(items[0].classList.contains('active')).to.be.false
      expect(items[1].classList.contains('active')).to.be.false
      expect(items[2].classList.contains('active')).to.be.true
    })

    it('should use identity, not deep equality, for duplicate siblings', () => {
      const items = container.querySelectorAll('.item')

      // items[0] and items[1] are identical markup; only the exact node activates
      el$('.item').setActiveItem('active', items[1])

      expect(items[0].classList.contains('active')).to.be.false
      expect(items[1].classList.contains('active')).to.be.true
    })
  })

  describe('elLegacy (undocumented pre-0.24 el contract)', () => {
    it('should return a single element for a single match', () => {
      expect(el$('.solo').elLegacy.nodeType).to.equal(1)
    })

    it('should return a NodeList for multiple matches', () => {
      const el = el$('.item').elLegacy
      expect(el.length).to.equal(3)
      expect(el.nodeType).to.be.undefined
    })

    it('should return an empty list for no matches', () => {
      expect(el$('.nope').elLegacy.length).to.equal(0)
    })
  })

  describe('removed legacy members', () => {
    it('should no longer define setActiveItem2, element, exist, nodeList, or getNodeListArray', () => {
      const s = el$('.item')
      expect(s.setActiveItem2).to.be.undefined
      expect(s.element).to.be.undefined
      expect(s.exist).to.be.undefined
      expect(s.nodeList).to.be.undefined
      expect(s.getNodeListArray).to.be.undefined
    })

    it('should keep unmount as a callable no-op for legacy apps', () => {
      expect(() => el$('.item').unmount()).to.not.throw()
    })
  })
})
