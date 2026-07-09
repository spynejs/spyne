import { safeClone, safeCloneDeep, safeAugment, safeFilter, safeMap, safeReject } from '../../spyne/utils/safe-clone'
import { SpyneAppProperties } from '../../spyne/utils/spyne-app-properties'
import { ChannelPayload } from '../../spyne/channels/channel-payload-class'

const PROXY_NAME = 'safeCloneTestProxy'

// stub reviver: wraps the cloned target in a Proxy that answers a marker key
const stubReviver = (target, proxyProps) => new Proxy(target, {
  get(t, key) {
    if (key === '__test__revived') {
      return true
    }
    return t[key]
  }
})

const makeProxyMarkedObj = (extraProps = {}) => ({
  __proxy__proxyName: PROXY_NAME,
  __proxy__isProxy: true,
  __proxy__props: {},
  headline: 'A Test Headline',
  ...extraProps
})

describe('safeClone proxy revival', () => {
  before(() => {
    SpyneAppProperties.registerProxyReviver(PROXY_NAME, stubReviver)
  })

  describe('safeClone (existing behavior)', () => {
    it('revives a root-level proxy object', () => {
      const revived = safeClone(makeProxyMarkedObj())
      expect(revived.__test__revived).to.be.true
      expect(revived.headline).to.equal('A Test Headline')
    })

    it('deep-copies a plain object without mutating the source', () => {
      const src = { a: { b: 1 } }
      const copy = safeClone(src)
      copy.a.b = 2
      expect(src.a.b).to.equal(1)
    })
  })

  describe('safeCloneDeep', () => {
    it('revives a root-level proxy object', () => {
      const revived = safeCloneDeep(makeProxyMarkedObj())
      expect(revived.__test__revived).to.be.true
    })

    it('revives a proxy nested inside a plain wrapper', () => {
      const wrapper = { pageData: { story: makeProxyMarkedObj() } }
      const copy = safeCloneDeep(wrapper)
      expect(copy.pageData.story.__test__revived).to.be.true
      expect(copy.pageData.story.headline).to.equal('A Test Headline')
    })

    it('revives proxies inside arrays', () => {
      const arr = [makeProxyMarkedObj(), { plain: true }]
      const copy = safeCloneDeep(arr)
      expect(copy[0].__test__revived).to.be.true
      expect(copy[1].plain).to.be.true
      expect(copy).to.not.equal(arr)
    })

    it('passes functions through by reference', () => {
      const fn = () => 'curried'
      const copy = safeCloneDeep({ curriedData: fn })
      expect(copy.curriedData).to.equal(fn)
    })

    it('does not infinitely recurse on cycles', () => {
      const obj = { name: 'cyclical' }
      obj.self = obj
      const copy = safeCloneDeep(obj)
      expect(copy.name).to.equal('cyclical')
    })

    it('returns primitives as-is', () => {
      expect(safeCloneDeep('str')).to.equal('str')
      expect(safeCloneDeep(5)).to.equal(5)
      expect(safeCloneDeep(null)).to.equal(null)
    })

    it('is reachable through safeClone(o, true)', () => {
      const wrapper = { story: makeProxyMarkedObj() }
      const copy = safeClone(wrapper, true)
      expect(copy.story.__test__revived).to.be.true
    })
  })

  describe('safeFilter / safeReject / safeMap', () => {
    const makeProxyMarkedArr = () => {
      const arr = [
        { menu_label: 'a', headline: 'A' },
        { menu_label: 'b', headline: 'B' },
        { menu_label: 'c', headline: 'C' }
      ]
      arr.__proxy__proxyName = PROXY_NAME
      arr.__proxy__isProxy = true
      arr.__proxy__props = {}
      return arr
    }

    it('safeFilter keeps element identity and re-wraps the array', () => {
      const src = makeProxyMarkedArr()
      const result = safeFilter(src, (o) => o.menu_label !== 'b')
      expect(result.length).to.equal(2)
      expect(result[0]).to.equal(src[0])          // element reference preserved
      expect(result.__test__revived).to.be.true   // array-level identity re-wrapped
    })

    it('safeReject is the inverse of safeFilter', () => {
      const src = makeProxyMarkedArr()
      const result = safeReject(src, (o) => o.menu_label === 'b')
      expect(result.length).to.equal(2)
      expect(result.map(o => o.menu_label).join('')).to.equal('ac')
      expect(result.__test__revived).to.be.true
    })

    it('safeMap gives callbacks writable copies of proxied elements', () => {
      const src = [makeProxyMarkedObj()]
      const result = safeMap(src, (el) => {
        el.type = 'story'
        return el
      })
      expect(result[0].type).to.equal('story')
      expect(result[0].__test__revived).to.be.true  // revived copy
      expect(src[0].type).to.equal(undefined)       // source untouched
    })

    it('safeMap passes plain elements by reference like native map', () => {
      const plainEl = { plain: true }
      const result = safeMap([plainEl], (el) => el)
      expect(result[0]).to.equal(plainEl)
    })

    it('all three degrade to native behavior on plain arrays', () => {
      const plain = [1, 2, 3]
      expect(safeFilter(plain, n => n > 1)).to.deep.equal([2, 3])
      expect(safeReject(plain, n => n > 1)).to.deep.equal([1])
      expect(safeMap(plain, n => n * 2)).to.deep.equal([2, 4, 6])
    })
  })

  describe('read-only payload facades (deepFreeze)', () => {
    it('wraps proxy subtrees in a write-blocking facade instead of freezing', () => {
      const proxyChild = makeProxyMarkedObj()
      const payload = { plainKey: 1, story: proxyChild }
      const frozen = ChannelPayload.deepFreeze(payload)

      expect(Object.isFrozen(frozen)).to.be.true          // plain shell frozen
      expect(frozen.story).to.not.equal(proxyChild)        // facade, not raw ref
      expect(frozen.story.headline).to.equal('A Test Headline') // reads pass through

      frozen.story.headline = 'MUTATED'                    // write silently blocked
      expect(proxyChild.headline).to.equal('A Test Headline')
      expect(frozen.story.headline).to.equal('A Test Headline')
    })

    it('reuses one facade per proxy across dispatches', () => {
      const proxyChild = makeProxyMarkedObj()
      const a = ChannelPayload.deepFreeze({ story: proxyChild })
      const b = ChannelPayload.deepFreeze({ story: proxyChild })
      expect(a.story).to.equal(b.story)
    })

    it('facade data still revives to a writable copy via safeCloneDeep', () => {
      const payload = ChannelPayload.deepFreeze({ story: makeProxyMarkedObj() })
      const writable = safeCloneDeep(payload)
      writable.story.type = 'story'
      expect(writable.story.type).to.equal('story')
      expect(writable.story.__test__revived).to.be.true
    })
  })

  describe('safeAugment', () => {
    it('returns a writable revived copy carrying the extra props', () => {
      const augmented = safeAugment(makeProxyMarkedObj(), { type: 'story', launchCode: 'hp3' })
      expect(augmented.__test__revived).to.be.true
      expect(augmented.type).to.equal('story')
      expect(augmented.launchCode).to.equal('hp3')
      expect(augmented.headline).to.equal('A Test Headline')
    })

    it('augments plain objects without mutating the source', () => {
      const src = { a: 1 }
      const augmented = safeAugment(src, { b: 2 })
      expect(augmented.b).to.equal(2)
      expect(src.b).to.equal(undefined)
    })
  })
})
