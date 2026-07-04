const { expect } = require('chai')
import { SpyneApp, SpyneAppProperties } from '../../spyne/spyne'
import sanitizeData, { sanitizeAttribute } from '../../spyne/utils/sanitize-data'
import sanitizeHTML from '../../spyne/utils/sanitize-html'
import { DomElement } from '../../spyne/views/dom-element'
import { DomElementTemplate } from '../../spyne/views/dom-element-template'

describe('sanitization security', () => {
  before(() => {
    // Idempotent: configures the sanitizers if no other suite has already.
    SpyneApp.init({})
  })

  describe('default posture', () => {
    it('should default SpyneAppProperties.mode to app', () => {
      expect(SpyneAppProperties.mode).to.equal('app')
    })

    it('should sanitize template HTML even when strict is false', () => {
      const dirty = '<img src="x" onerror="alert(1)"><script>bad()</script><b>keep</b>'
      const clean = String(sanitizeHTML(dirty))

      expect(clean).to.not.include('onerror')
      expect(clean).to.not.include('<script')
      expect(clean).to.include('<b>keep</b>')
    })
  })

  describe('sanitizeAttribute', () => {
    it('should block event-handler attributes', () => {
      expect(sanitizeAttribute('onclick', 'evil()').allowed).to.be.false
      expect(sanitizeAttribute('ONERROR', 'evil()').allowed).to.be.false
    })

    it('should block javascript: URIs on URL attributes', () => {
      expect(sanitizeAttribute('href', 'javascript:alert(1)').allowed).to.be.false
      expect(sanitizeAttribute('src', 'JaVaScRiPt:alert(1)').allowed).to.be.false
      expect(sanitizeAttribute('formaction', 'vbscript:x').allowed).to.be.false
    })

    it('should block whitespace-obfuscated schemes', () => {
      expect(sanitizeAttribute('href', 'jav\tascript:alert(1)').allowed).to.be.false
      expect(sanitizeAttribute('href', ' javascript:alert(1)').allowed).to.be.false
      expect(sanitizeAttribute('href', 'java\nscript:alert(1)').allowed).to.be.false
    })

    it('should allow safe and relative URIs', () => {
      expect(sanitizeAttribute('href', 'https://example.com').allowed).to.be.true
      expect(sanitizeAttribute('href', '/page/one').allowed).to.be.true
      expect(sanitizeAttribute('href', '#section').allowed).to.be.true
      expect(sanitizeAttribute('href', 'mailto:a@b.com').allowed).to.be.true
      expect(sanitizeAttribute('src', 'data:image/png;base64,AA==').allowed).to.be.true
    })

    it('should block data URIs that are not images', () => {
      expect(sanitizeAttribute('src', 'data:text/html,<script>x</script>').allowed).to.be.false
    })

    it('should sanitize srcdoc as an HTML document', () => {
      const result = sanitizeAttribute('srcdoc', '<script>bad()</script><p>ok</p>')

      expect(result.allowed).to.be.true
      expect(result.value).to.not.include('<script')
      expect(result.value).to.include('<p>ok</p>')
    })

    it('should pass non-URL attributes through untouched', () => {
      const result = sanitizeAttribute('id', 'my-id')

      expect(result.allowed).to.be.true
      expect(result.value).to.equal('my-id')
    })
  })

  describe('sanitizeData modes', () => {
    it('should strip scripts and iframes in app mode', () => {
      const clean = sanitizeData('<script>bad()</script><iframe src="https://x.com"></iframe><b>keep</b>', { mode: 'app' })

      expect(clean).to.not.include('<script')
      expect(clean).to.not.include('<iframe')
      expect(clean).to.include('<b>keep</b>')
    })

    it('should sanitize nested object and array values', () => {
      const data = {
        title: '<script>bad()</script>ok',
        items: ['<b>fine</b>', { deep: '<script>x</script>deep-ok' }]
      }
      const clean = sanitizeData(data, { mode: 'app' })

      expect(clean.title).to.equal('ok')
      expect(clean.items[0]).to.equal('<b>fine</b>')
      expect(clean.items[1].deep).to.equal('deep-ok')
    })

    it('should keep iframes in richtext mode with a forced sandbox', () => {
      const clean = sanitizeData('<iframe src="https://example.com/embed"></iframe>', { mode: 'richtext' })

      expect(clean).to.include('<iframe')
      expect(clean).to.include('sandbox=')
    })

    it('should remove non-https iframe src in richtext mode', () => {
      const clean = sanitizeData('<iframe src="http://example.com/embed"></iframe>', { mode: 'richtext' })

      expect(clean).to.include('<iframe')
      expect(clean).to.not.include('src=')
    })

    it('should drop javascript: hrefs in richtext content', () => {
      const clean = sanitizeData('<a href="javascript:alert(1)">x</a>', { mode: 'richtext' })

      expect(clean).to.not.include('javascript:')
    })

    it('should return data untouched with per-call disableSanitize', () => {
      const raw = '<script>kept-by-request()</script>'

      expect(sanitizeData(raw, { disableSanitize: true })).to.equal(raw)
    })
  })

  describe('iframe policy', () => {
    it('should allow iframes in app mode with iframes.allow', () => {
      const clean = sanitizeData('<iframe src="https://example.com/embed"></iframe>', {
        mode: 'app',
        iframes: { allow: true }
      })

      expect(clean).to.include('<iframe')
      expect(clean).to.include('sandbox=')
    })

    it('should strip iframes from richtext mode with iframes.allow false', () => {
      const clean = sanitizeData('<iframe src="https://example.com/embed"></iframe><b>keep</b>', {
        mode: 'richtext',
        iframes: { allow: false }
      })

      expect(clean).to.not.include('<iframe')
      expect(clean).to.include('<b>keep</b>')
    })

    it('should enforce the origin allowlist on iframe src', () => {
      const opts = {
        mode: 'richtext',
        iframes: { allowedOrigins: ['https://www.youtube.com'] }
      }

      const allowed = sanitizeData('<iframe src="https://www.youtube.com/embed/abc"></iframe>', opts)
      const blocked = sanitizeData('<iframe src="https://evil.example.com/embed"></iframe>', opts)

      expect(allowed).to.include('src="https://www.youtube.com/embed/abc"')
      expect(blocked).to.include('<iframe')
      expect(blocked).to.not.include('src=')
    })

    it('should respect a custom sandbox value and sandbox false', () => {
      const custom = sanitizeData('<iframe src="https://example.com/e"></iframe>', {
        mode: 'richtext',
        iframes: { sandbox: 'allow-scripts' }
      })
      const disabled = sanitizeData('<iframe src="https://example.com/e"></iframe>', {
        mode: 'richtext',
        iframes: { sandbox: false }
      })

      expect(custom).to.include('sandbox="allow-scripts"')
      expect(disabled).to.not.include('sandbox')
    })

    it('should keep an author-specified sandbox attribute', () => {
      const clean = sanitizeData('<iframe src="https://example.com/e" sandbox="allow-forms"></iframe>', {
        mode: 'richtext'
      })

      expect(clean).to.include('sandbox="allow-forms"')
    })

    it('should apply iframe policy on the DomElement attribute channel', () => {
      const el = new DomElement({
        tagName: 'iframe',
        attributes: { src: 'https://example.com/embed' }
      }).render()

      expect(el.getAttribute('src')).to.equal('https://example.com/embed')
      expect(el.getAttribute('sandbox')).to.be.a('string')
    })

    it('should block non-https iframe src on the DomElement attribute channel', () => {
      const el = new DomElement({
        tagName: 'iframe',
        attributes: { src: 'http://example.com/embed' }
      }).render()

      expect(el.hasAttribute('src')).to.be.false
    })

    it('should allow same-origin relative iframe src', () => {
      const clean = sanitizeData('<iframe src="/static/iframes/tool/index.html"></iframe>', {
        mode: 'richtext'
      })

      expect(clean).to.include('src="/static/iframes/tool/index.html"')
    })

    it('should allow same-origin absolute iframe src regardless of scheme', () => {
      const sameOriginUrl = `${window.location.origin}/static/iframes/tool/index.html`
      const clean = sanitizeData(`<iframe src="${sameOriginUrl}"></iframe>`, {
        mode: 'richtext'
      })

      expect(clean).to.include(`src="${sameOriginUrl}"`)
    })

    it('should allow http on localhost hosts as a secure context', () => {
      const clean = sanitizeData('<iframe src="http://localhost:8123/dev-tool.html"></iframe>', {
        mode: 'richtext'
      })

      expect(clean).to.include('src="http://localhost:8123/dev-tool.html"')
    })

    it('should allow same-origin src even when an origin allowlist is set', () => {
      const clean = sanitizeData('<iframe src="/local/tool.html"></iframe>', {
        mode: 'richtext',
        iframes: { allowedOrigins: ['https://www.youtube.com'] }
      })

      expect(clean).to.include('src="/local/tool.html"')
    })
  })

  describe('DomElement attribute guard', () => {
    it('should drop unsafe attribute values and keep safe ones', () => {
      const el = new DomElement({
        tagName: 'a',
        attributes: {
          href: 'javascript:alert(1)',
          onclick: 'evil()',
          id: 'safe-id',
          title: 'safe title'
        }
      }).render()

      expect(el.hasAttribute('href')).to.be.false
      expect(el.hasAttribute('onclick')).to.be.false
      expect(el.getAttribute('id')).to.equal('safe-id')
      expect(el.getAttribute('title')).to.equal('safe title')
    })

    it('should keep safe URL attributes', () => {
      const el = new DomElement({
        tagName: 'a',
        attributes: { href: 'https://example.com/page' }
      }).render()

      expect(el.getAttribute('href')).to.equal('https://example.com/page')
    })

    it('should apply dataset values untouched', () => {
      const el = new DomElement({
        tagName: 'div',
        attributes: { dataset: { pageId: 'page-1' } }
      }).render()

      expect(el.dataset.pageId).to.equal('page-1')
    })
  })

  describe('DomElementTemplate output', () => {
    it('should sanitize renderToString output', () => {
      const tmpl = new DomElementTemplate('<b>{{word}}</b><script>bad()</script>', { word: 'hello' })
      const html = tmpl.renderToString()

      expect(html).to.not.include('<script')
      expect(html).to.include('<b>hello</b>')
    })

    it('should sanitize renderDocFrag output', () => {
      const tmpl = new DomElementTemplate('<p>{{word}}</p><img src="x" onerror="alert(1)">', { word: 'hi' })
      const frag = tmpl.renderDocFrag()
      const div = document.createElement('div')
      div.appendChild(frag)

      expect(div.innerHTML).to.not.include('onerror')
      expect(div.innerHTML).to.include('<p>hi</p>')
    })
  })
})
