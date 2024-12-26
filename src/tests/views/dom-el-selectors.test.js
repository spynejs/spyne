import { spyneDocsDomStr } from '../mocks/spyne-docs.mocks'
import { ViewStreamSelector } from '../../spyne/views/view-stream-selector'

import * as R from 'ramda'

describe('Dom Item Selector', () => {
  beforeEach(function() {
    document.body.insertAdjacentHTML('afterbegin', spyneDocsDomStr)
  }
  )

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('app'))
  })

  it('should return the same el', () => {
    const el = document.querySelector('ul#my-list')
    const elNode = ViewStreamSelector(el)
    const elNodesEqual = el.isEqualNode(elNode.el)
    expect(elNodesEqual).to.eq(true)
  })

  it('should return array containing the same el', () => {
    const el = document.querySelector('body')
    const liSelStr = 'ul#my-list'
    const listEl = document.querySelector(liSelStr)
    const elNode = ViewStreamSelector(el, liSelStr).arr
    const elNodesEqual = listEl.isEqualNode(elNode[0])
    expect(elNodesEqual).to.eq(true)
  })

  it('should return the same el from selector', () => {
    const el = document.querySelector('ul#my-list')
    const el$ = ViewStreamSelector('ul#my-list')
    const elNodesEqual = el.isEqualNode(el$.el)
    expect(elNodesEqual).to.eq(true)
  })

  it('should return local li', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const liList = el$('li')
    expect(liList.el.length).to.eq(5)
  })
  it('should add class to li', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const liList = el$('li')
    liList.addClass('foo')
    const hasFooClassBool = liList.el[0].classList.contains('foo')
    expect(hasFooClassBool).to.eq(true)
  })

  it('should remove class to li', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const liList = el$('li')
    liList.removeClass('has-svg')
    const hasSvgClassBool = liList.el[0].classList.contains('has-svg')
    expect(hasSvgClassBool).to.eq(false)
  })

  it('should set class foo bar', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const liList = el$('li')
    liList.setClass('foo bar')
    // console.log('liList ',liList.el[0].className)
    const isFooBarClassBool = liList.el[0].className === 'foo bar'
    expect(isFooBarClassBool).to.eq(true)
  })

  it('should add inline css', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const liList = el$('li')
    liList.inlineCss = 'background:orange;'
    const backgroundSetBool = liList.el[0].style.getPropertyValue('background') === 'orange'
    expect(backgroundSetBool).to.eq(true)
  })

  it('should add toogle Class', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const liList = el$('li')
    liList.toggleClass('foo', true)
    const hasFooClassBool = liList.el[0].classList.contains('foo')
    expect(hasFooClassBool).to.eq(true)
  })

  it('should toggle based on el selector', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const el1 = el.querySelector('li:nth-child(1)')
    const liList = el$('li')
    liList.setActiveItem('bar', 'li:nth-child(1)')
    const hasBarClassBool = el1.classList.contains('bar')
    expect(hasBarClassBool).to.eq(true)
  })

  it('should toggle based on element', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const el1 = el.querySelector('li:nth-child(1)')
    const liList = el$('li')
    liList.setActiveItem('bar', el1)
    const hasBarClassBool = el1.classList.contains('bar')
    expect(hasBarClassBool).to.eq(true)
  })

  it('should setActiveItem based on el selector', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const el1 = el.querySelector('li:nth-child(1)')
    const liList = el$('li')
    liList.setActiveItem('bar', 'li:nth-child(1)')
    const hasBarClassBool = el1.classList.contains('bar')
    expect(hasBarClassBool).to.eq(true)
  })

  it('should check selector for node', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const el1 = el.querySelector('li:nth-child(1)')
    const liList = el$('li')
    liList.setActiveItem('bar', 'li:nth-child(5)')
    const hasBarClassBool = el1.classList.contains('bar')
    expect(hasBarClassBool).to.eq(false)
  })

  it('should setActiveItem based on el', () => {
    const el = document.querySelector('ul#my-list')
    const el$ =   ViewStreamSelector('ul#my-list')
    const el1 = el.querySelector('li:nth-child(1)')
    const liList = el$('li')
    liList.setActiveItem('bar', el1)
    const hasBarClassBool = el1.classList.contains('bar')
    expect(hasBarClassBool).to.eq(true)
  })
})
