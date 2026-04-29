import { includes, __, ifElse, path, prop, reject, is, isNil, isEmpty } from 'ramda'
import sanitizeHTML from '../utils/sanitize-html.js'
import { SpyneAppProperties } from '../utils/spyne-app-properties.js'

/**
 * DomElementTemplate
 *
 * Mustache-compatible template engine used by ViewStream and DomElement for HTML rendering.
 *
 * Supported syntax:
 *   {{key}}                          variable interpolation, HTML-escaped
 *   {{key.path.to.value}}            dot-notation property access
 *   {{#key}}...{{/key}}              array/object sections
 *   {{.}}                            current element inside a loop
 *   {{#}}...{{/}}                    top-level bare array (passed as `data`)
 *
 * Nesting:
 *   DomElementTemplate supports exactly ONE level of nested array sections.
 *   A template like {{#rows}}...{{#cells}}...{{/cells}}...{{/rows}} is supported.
 *   Deeper nesting — {{#a}}{{#b}}{{#c}}...{{/c}}{{/b}}{{/a}} — is NOT supported.
 *
 *   When a template has deeper nesting, a warning is logged in debug mode and
 *   the third-level loop is not processed. This is a deliberate design choice:
 *   deep hierarchical rendering belongs in nested ViewStreams, not in templates.
 *   Nested ViewStreams provide proper lifecycle semantics, isolated rendering,
 *   and clearer architectural boundaries than arbitrarily-nested templates.
 *
 * Not currently supported in nested loops:
 *   - CMS proxy metadata (__cms__dataId, __cms__keyFor_*). Inner-loop CMS
 *     editing is a future enhancement; until then, content inside an inner
 *     loop is rendered as read-only from the CMS perspective.
 */
export class DomElementTemplate {
  constructor(template, data = {}, opts = {}) {
    this.template = this.formatTemplate(template)
    this.isProxyData = data.__cms__isProxy === true
    this.testMode = opts?.testMode

    // Normalize triple-bracket tags to double-bracket.
    //
    // DomElementTemplate treats {{{key}}} as an alias for {{key}} — both
    // interpolate the value as-is. Mustache's convention of "triple-bracket
    // means unescaped" doesn't apply here because SpyneJS handles escaping
    // and sanitization through `sanitize-data` (keyed on SpyneApp mode)
    // before values reach the template, not through syntax-level escaping.
    //
    // We accept triple-bracket syntax so that authors and AI familiar with
    // standard Mustache don't have their templates silently break when they
    // reach for {{{key}}} out of habit. The normalization happens once here,
    // so the rest of the engine only ever reasons about double-bracket tags.
    this.template = DomElementTemplate.normalizeTripleBrackets(this.template)

    if (this.isProxyData === true) {
      if (SpyneAppProperties.enableCMSProxies === true) {
        this.template = SpyneAppProperties.formatTemplateForProxyData(this.template)
      } else {
        console.warn('You need to be logged in to use the CMS Tools.')
      }
    }

    const checkForArrayData = () => {
      if (is(Array, data) === true) {
        data = { spyneData:data }
        this.template = this.template.replace('{{/}}', '{{/spyneData}}')
        this.template = this.template.replace('{{#}}', '{{#spyneData}}')
      }
    }

    checkForArrayData()

    this.templateData = data

    // Stash used by per-iteration substitution so that CMS proxy lookups
    // for string-array items (where __cms__dataId / __cms__keyFor_* live on
    // the PARENT array, not on the individual string elements) can find the
    // parent object at render time. Set by parseTheTmplLoop, cleared when
    // that loop completes.
    this.currentOuterLoopData = null

    const strArr = DomElementTemplate.getStringArray(this.template)

    let strMatches = this.template.match(DomElementTemplate.findTmplLoopsRE())
    strMatches = strMatches === null ? [] : strMatches

    const parseTmplLoopsRE = DomElementTemplate.parseTmplLoopsRE()

    const parseTmplLoopFn = this.parseTheTmplLoop.bind(this)

    const mapTmplLoop = (str) => {
      return str.replace(parseTmplLoopsRE, parseTmplLoopFn)
    }

    const findTmplLoopsPred = includes(__, strMatches)
    const checkForMatches = ifElse(
      findTmplLoopsPred,
      mapTmplLoop,
      this.addParams.bind(this))

    this.finalArr = strArr.map(checkForMatches)
  }

  static isPrimitiveTag(str) {
    return /({{\.\*?}})/.test(str)
  }

  /**
   * Normalizes triple-bracket tags to double-bracket form.
   *
   *   {{{key}}}       → {{key}}
   *   {{{a.b.c}}}     → {{a.b.c}}
   *   {{{.}}}         → {{.}}
   *   {{{.*}}}        → {{.*}}
   *
   * Section markers {{#key}} and {{/key}} are already two-bracket by
   * convention and are not affected. Tags of the wrong shape (unbalanced,
   * four or more brackets, etc.) are left untouched — anything the main
   * parser doesn't recognize later will render as literal text, which is
   * the correct failure mode for a logic-less template engine.
   *
   * This exists because DomElementTemplate treats {{{key}}} and {{key}}
   * as interchangeable — sanitization and escaping are config-driven
   * through `sanitize-data`, not syntax-driven through bracket count.
   * Normalizing at construction time means the rest of the engine (loop
   * regexes, CMS proxy wrapping, variable substitution) only reasons
   * about one bracket style.
   */
  static normalizeTripleBrackets(template) {
    if (typeof template !== 'string' || template.indexOf('{{{') === -1) {
      return template
    }
    // Match balanced triple-brackets containing anything that isn't a
    // brace character. Keeps the captured inner content, strips the
    // outer third brace on each side.
    return template.replace(/\{\{\{([^{}]+?)\}\}\}/g, '{{$1}}')
  }

  // FIND CORRECT NESTED DATA
  static getNestedDataReducer(data = {}, param = '') {
    const dataReducer = (nestedData, str) => {
      if (nestedData[str]) {
        return nestedData[str]
      }
      return typeof nestedData === 'string' ? nestedData : ''
    }

    return /(\.)/gm.test(String(param)) ? String(param).split('.').reduce(dataReducer, data) : data[param] ?? ''
  }

  static getStringArray(template) {
    const strArr = template.split(DomElementTemplate.findTmplLoopsRE())
    const emptyRE = /^([\\n\s\W]+)$/
    // findTmplLoopsRE has TWO capture groups (the full loop match, and the
    // \2-backreferenced key name). When used with String.prototype.split, the
    // second group is emitted into the result array as a leaked chunk.
    //
    // The chunks arrive in a predictable 3-step cycle:
    //   index 0:                pre-text before the first loop
    //   index 1: full match     the loop (keep)
    //   index 2: group-2 leak   the loop's key name (discard)
    //   index 3:                between-loops text
    //   index 4: full match
    //   index 5: group-2 leak
    //   ...
    // So any index i where i >= 2 and (i - 2) % 3 === 0 is a key-name leak
    // that should not flow into the render pipeline.
    const withoutLeaks = strArr.filter((_, i) => !(i >= 2 && (i - 2) % 3 === 0))
    const filterOutEmptyStrings = s => s.match(emptyRE)
    const finalStr = reject(filterOutEmptyStrings, withoutLeaks)

    return finalStr
  }

  /**
   * Regex that finds top-level loop sections, pairing each opening tag with a
   * closing tag of the SAME NAME via the \2 backreference. This is what makes
   * {{#rows}}<tr>{{#cells}}<td>{{.}}</td>{{/cells}}</tr>{{/rows}} match as a
   * single outer loop rather than getting truncated at the inner {{/cells}}.
   */
  static findTmplLoopsRE() {
    return /({{#([\w.]+)}}[\w\n\s\W]+?{{\/\2}})/gm
  }

  static parseTmplLoopsRE() {
    return /({{#([\w.]+)}})([\w\n\s\W]+?)({{\/\2}})/gm
  }

  /**
   * Regex for finding a single inner loop inside an outer loop's body.
   * Identical in form to parseTmplLoopsRE, but created fresh to avoid
   * shared-lastIndex bugs with global regexes when used in .replace callbacks.
   */
  static innerLoopRE() {
    return /({{#([\w.]+)}})([\w\n\s\W]+?)({{\/\2}})/gm
  }

  static swapParamsForTagsRE() {
    return /({{)(.*?)(}})/gm
  }

  /**
   * Detects whether a template body contains any {{#key}}...{{/key}} pair.
   * Used to decide whether the inner-loop pass is needed, and to detect
   * two-level nesting for warning purposes.
   */
  static hasLoop(str) {
    return DomElementTemplate.innerLoopRE().test(str)
  }

  removeThis() {
    if (this !== undefined) {
      this.finalArr = undefined
      this.templateData = undefined
      this.template = undefined
    }
  }

  /**
   * @desc Returns a document fragment generated from the template and any added data.
   */
  renderDocFrag() {
    let html = DomElementTemplate.replaceImgPath(this.finalArr.join(''))
    if (this.testMode !== true) {
      html = sanitizeHTML(html)
    }
    const isTableSubTag = /^([^>]*?)(<){1}(\b)(thead|col|colgroup|tbody|td|tfoot|tr|th)(\b)([^\0]*)$/.test(html)
    const el = isTableSubTag ? html : document.createRange().createContextualFragment(html)

    window.setTimeout(this.removeThis, 2)
    return el
  }

  renderToString() {
    let html = this.finalArr.join('')
    html = DomElementTemplate.replaceImgPath(html)
    window.setTimeout(this.removeThis, 2)
    return html
  }

  getTemplateString() {
    return this.finalArr.join('')
  }

  formatTemplate(template) {
    return ['SCRIPT', 'TEMPLATE'].includes(prop('nodeName', template)) === true ? template.innerHTML : template
  }

  getDataValFromPathStr(pathStr, dataFile) {
    const pathArr = String(pathStr).split('.')
    const pathData = path(pathArr, dataFile)
    return pathData || ''
  }

  addParams(str) {
    const replaceTags = (str, p1, p2, p3) => {
      return DomElementTemplate.getNestedDataReducer(this.templateData, p2)
    }
    return str.replace(DomElementTemplate.swapParamsForTagsRE(), replaceTags)
  }

  static replaceImgPath(templateStr) {
    const { IMG_PATH } = SpyneAppProperties
    if (IMG_PATH !== undefined) {
      templateStr = templateStr.replaceAll(/src\s*=\s*(['"])imgs\//g, `src=$1${IMG_PATH}`)
      return templateStr.replaceAll(/url\(\s*(['"]?)imgs\//g, `url($1${IMG_PATH}`)
    }
    return templateStr
  }

  /**
   * Resolves a single inner loop (one level down) inside an outer-loop body,
   * using `parentItem` as the data context. If the inner body itself contains
   * another loop, a debug-mode warning is logged and that deeper loop is not
   * processed.
   *
   * Returns the body string with any inner loop expanded, ready for
   * outer-level variable substitution.
   */
  processInnerLoop(bodyStr, parentItem) {
    const innerRE = DomElementTemplate.innerLoopRE()

    return bodyStr.replace(innerRE, (fullMatch, openTag, innerKey, innerBody /*, closeTag */) => {
      // Detect disallowed second-level nesting inside the inner body.
      if (DomElementTemplate.hasLoop(innerBody) === true) {
        if (SpyneAppProperties.debug === true && this.testMode !== true) {
          console.warn(
            'Spyne Warning: DomElementTemplate supports one level of nested array loops. ' +
            `A deeper nested loop was detected inside "{{#${innerKey}}}". ` +
            'Consider restructuring via nested ViewStreams instead.'
          )
        }
        // Strip unsupported deeper-level section tags so they don't emit as
        // garbled variables during substitution below.
        innerBody = innerBody.replace(/{{[#/][\w.]+}}/g, '')
      }

      const innerData = DomElementTemplate.getNestedDataReducer(parentItem, innerKey)

      if (isNil(innerData) === true || isEmpty(innerData)) {
        return ''
      }

      const innerArr = Array.isArray(innerData) ? innerData : [innerData]

      // While processing an inner loop, the "outer" data for CMS string-item
      // lookups is the current innerData (the array/object the inner items
      // belong to), not the original outer-loop array. Swap it in, restore
      // when the inner pass completes.
      const previousOuter = this.currentOuterLoopData
      this.currentOuterLoopData = innerData

      const rendered = innerArr.map((innerItem, innerIdx) => {
        return this.substituteForItem(innerBody, innerItem, innerIdx)
      }).join('')

      this.currentOuterLoopData = previousOuter
      return rendered
    })
  }

  /**
   * Substitutes {{...}} variables in `str` using `item` as the data context.
   *
   * Three cases:
   *
   *   1. String item + primitive {{.}}/{{.*}} template:
   *      direct text substitution (no CMS wrapping possible — this path only
   *      runs when formatTemplateForProxyData has NOT wrapped the tag).
   *
   *   2. String item + non-primitive template:
   *      can happen two ways: (a) a section iterating strings where
   *      formatTemplateForProxyData has replaced {{.}}/{{.*}} with
   *      {{spyneLoopKey}} + {{origKey}} inside a <spyne-cms-item> wrapper,
   *      or (b) a non-proxy template with positional tokens only.
   *      Build a context that satisfies both — spyneLoopKey = the string,
   *      plus __cms__dataId / origKey looked up on the parent array when
   *      proxy data is active.
   *
   *   3. Object item:
   *      the conventional path — build a lookup object with the item's
   *      properties plus positional tokens, substitute by property name
   *      or dot-path.
   */
  substituteForItem(str, item, index) {
    // Case 1: string item with a primitive-tag template.
    if (typeof item === 'string') {
      if (DomElementTemplate.isPrimitiveTag(str)) {
        const escaped = item.replace(/\$/g, '$$$$') // $ -> $$ for replace() literal safety
        return str.replace(DomElementTemplate.swapParamsForTagsRE(), escaped)
      }

      // Case 2: string item with a non-primitive template.
      const ctx = this.buildStringItemContext(item, index)
      return this.substituteObject(str, ctx)
    }

    // Case 3: object item.
    const dataObj = this.buildItemContext(item, index)
    return this.substituteObject(str, dataObj)
  }

  /**
   * Builds the per-iteration lookup context for a STRING item.
   *
   * Always includes:
   *   - spyneLoopKey: the string itself (matches the CMS proxy wrapping,
   *     which replaces {{.}}/{{.*}} inside string loops with {{spyneLoopKey}})
   *   - loopIndex / loopNum: positional tokens
   *
   * When proxy data is active, additionally includes:
   *   - __cms__dataId: the CMS identifier for the PARENT array (the string
   *     items themselves are primitives and don't carry the id)
   *   - origKey: the original key the CMS uses to address this specific
   *     string within its parent, looked up via __cms__keyFor_<item>
   */
  buildStringItemContext(item, index) {
    const context = {
      spyneLoopKey: item,
      loopIndex: index,
      loopNum: index + 1
    }

    if (this.isProxyData === true) {
      const outerData = this.currentOuterLoopData
      if (outerData && typeof outerData === 'object') {
        context.__cms__dataId = outerData.__cms__dataId || ''
        const keyIdStr = `__cms__keyFor_${item}`
        context.origKey = outerData[keyIdStr] !== undefined ? outerData[keyIdStr] : ''
      } else {
        context.__cms__dataId = ''
        context.origKey = ''
      }
    }

    return context
  }

  /**
   * Builds the per-iteration lookup context for an OBJECT item, including
   * CMS-proxy metadata when this template is rendering proxied data.
   */
  buildItemContext(item, index) {
    const context = Object.assign({}, item, {
      loopIndex: index,
      loopNum: index + 1
    })

    if (this.isProxyData === true) {
      context.__cms__dataId = item.__cms__dataId
      context.spyneLoopKey = item
      context.loopIndex = index
      context.loopNum = index + 1
    }

    return context
  }

  /**
   * Replaces {{key}} and {{a.b.c}} tokens in `str` using `ctx` as the source.
   */
  substituteObject(str, ctx) {
    const reDot = /(\.)/gm
    const positional = { loopIndex: ctx.loopIndex, loopNum: ctx.loopNum }

    const replacer = (match, p1, p2) => {
      // Auto-injected positional tokens take precedence
      if (positional[p2] !== undefined) return positional[p2]

      // Simple key access
      if (reDot.test(p2) === false && ctx[p2] !== undefined) {
        return ctx[p2]
      }

      // Dot-path access
      return this.getDataValFromPathStr(p2, ctx)
    }

    return str.replace(DomElementTemplate.swapParamsForTagsRE(), replacer)
  }

  /**
   * Entry point for each top-level loop match. Extracts loop data, runs the
   * inner-loop pass on the body for each iteration, then substitutes outer
   * variables.
   */
  parseTheTmplLoop(str, p1, p2, p3) {
    const outerBody = p3
    const elData = DomElementTemplate.getNestedDataReducer(this.templateData, p2)

    if (isNil(elData) === true || isEmpty(elData)) {
      return ''
    }

    // Stash the outer data so that per-iteration substitution can look up
    // CMS proxy metadata (__cms__dataId, __cms__keyFor_*) that lives on the
    // parent array object — not on individual string elements.
    const previousOuter = this.currentOuterLoopData
    this.currentOuterLoopData = elData

    const elArr = Array.isArray(elData) ? elData : [elData]

    // Whether the outer body contains an inner loop is cheap to test and lets
    // us skip the inner-loop processing entirely for the common single-level case.
    const bodyHasInnerLoop = DomElementTemplate.hasLoop(outerBody)

    const rendered = elArr.map((item, index) => {
      const body = bodyHasInnerLoop
        ? this.processInnerLoop(outerBody, item)
        : outerBody

      return this.substituteForItem(body, item, index)
    }).join('')

    this.currentOuterLoopData = previousOuter
    return rendered
  }
}
