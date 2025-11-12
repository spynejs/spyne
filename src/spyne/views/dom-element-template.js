import { includes, __, ifElse, path, prop, reject, is, isNil, isEmpty } from 'ramda'
import sanitizeHTML from '../utils/sanitize-html.js'
import { SpyneAppProperties } from '../utils/spyne-app-properties.js'

/**
 * @module DomElTemplate
 * @type util
 *
 * @constructor
 * @param {String|HTMLElement} template
 * @param {Object} data
 *
 * @desc DomElement uses this class when rendering templates.
 *
 * @example
 * TITLE["<h4>Accessing properties using a double bracket {{&nbsp;&nbsp;&nbsp;}} expression</h4>"]
 * const data = {{name:"World}};
 * const template = `<p>Hello {{name}}!</p>`;
 *
 * this.props.el.appendChild(new
 * DocElTemplate(template,data).renderDocFrag());
 *
 * // Outputs
 * <p>Hello World!</p>
 *
 *
 *
 * @example
 * TITLE["<h4>Looping through an an array of objects using loop {{#loopProperty}} {{property}} {{/loopProperty}} expression</h4>"]
 * const data = {animals: [
 *   {animal: 'cat', sound: 'meow'},
 *   {animal: 'dog', sound: 'woof'},
 *   {animal: 'bird', sound: tweet'}
 * ]};
 *
 * const template = `
 * <ul>
 * {{#animals}}
 *   <li>The {{animal}} says '{{sound}}'.</li>
 * {{/animals}}
 * </ul>`;
 *
 * this.props.el.appendChild(new
 * DocElTemplate(template,data).renderDocFrag());
 *
 * // Outputs
 * <ul>
 *    <li>The cat says 'meow'.</li>
 *    <li>The dog says 'woof'.</li>
 *    <li>The bird says 'tweet'.</li>
 * </ul>
 *
 *
 *
 * @example
 * TITLE["<h4>Looping through list items in an array of using {{#arrName}} &nbsp;&nbsp;{{.}}&nbsp;&nbsp; {{/arrName}} expression</h4>"]
 * const data =  {name: 'Jane', pets: ['Milo','Luna','Kiki']};
 * const template = "<article>
 *                  <h3>Welcome, {{name}}, your pets are:</h3>
 *                  <ul>{{#pets}}
 *                    <li>{{.}}, </li>
 *                    {{/pets}}
 *                 </ul></article>";
 *
 * this.props.el.appendChild(new
 * DocElTemplate(template,data).renderDocFrag());
 *
 * // Outputs
 * <article>
 *   <h3>Welcome Jane, your pets are:</h3>
 *    <ul>
 *       <li>Milo</li>
 *       <li>Luna</li>
 *       <li>Kiki</li>
 *    </ul>
 * </article>
 *
 *
 * @example
 * TITLE["<h4>Looping through an array with no property name using {{#}} &nbsp;&nbsp;{{ }}&nbsp;&nbsp; {{/}} expression</h4>"]
 * const data = [
 *      {item: 'Cookie', calories: 142},
 *      {item: 'Apple',  calories: 95},
 *      {item: 'Cheese', calories: 113}];
 *
 * const template = `
 * <article>
 * <h3>Snacks:</h3>
 *   <ul>
 *      {{#}}
 *      <li>{{item}}, calories: {{calories}}</li>
 *      {{/}}
 *   </ul>
 * </article>
 * `;
 *
 * this.props.el.appendChild(new
 * DocElTemplate(template,data).renderDocFrag());
 *
 * // Outputs
 * <article>
 *   <h3>Snacks</h3>
 *    <ul>
 *       <li>Cookie, calories: 142</li>
 *       <li>Apple, calories: 95</li>
 *       <li>Cheese, calories: 113</li>
 *    </ul>
 * </article>
 *
 *
 * @example
 * TITLE["<h4>Looping through an array with no property name using {{#}} &nbsp;&nbsp;{{ . }}&nbsp;&nbsp; {{/}} expression</h4>"]
 * const data = ['Tyrion', 'Arya', 'Jon Snow', 'Sansa'];
 * const template = `
 * <h3>Main GoT Characters</h3>
 * <ul>
 *  {{#}}
 *   <li>{{.}}</li>
 *  {{/}}
 *  </ul>';
 *
 * this.props.el.appendChild(new
 * DocElTemplate(template,data).renderDocFrag());
 *
 * //Outputs
 * <h3>Main GoT Characters</h3>
 * <ul>
 *   <li>Tyrion</li>
 *   <li>Arya</li>
 *   <li>Jon Snow</li>
 *   <li>Sansa</li>
 * </ul>
 *
 *
 */

export class DomElementTemplate {
  constructor(template, data = {}, opts = {}) {
    this.template = this.formatTemplate(template)
    this.isProxyData = data.__cms__isProxy === true
    this.testMode = opts?.testMode

    /*
    if (this.isProxyData === true) {
      console.log('PROXY IS ', data.__cms__rootData)
      this.template = DomElementTemplate.formatTemplateForProxyData(this.template)
    }
*/

    if (SpyneAppProperties.enableCMSProxies && this.isProxyData === true) {
      this.template = SpyneAppProperties.formatTemplateForProxyData(this.template)
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

    const strArr = DomElementTemplate.getStringArray(this.template)

    let strMatches = this.template.match(DomElementTemplate.findTmplLoopsRE())
    strMatches = strMatches === null ? [] : strMatches

    const parseTmplLoopsRE = DomElementTemplate.parseTmplLoopsRE()

    const parseTmplLoopFn =  this.parseTheTmplLoop.bind(this)

    const mapTmplLoop = (str, data) => {
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
    const filterOutEmptyStrings = s => s.match(emptyRE)
    const finalStr =  reject(filterOutEmptyStrings, strArr)

    return finalStr
  }

  static findTmplLoopsRE() {
    return /({{#[\w.]+}}[\w\n\s\W]+?{{\/[\w.]+}})/gm
  }

  static parseTmplLoopsRE() {
    return /({{#([\w.]+)}})([\w\n\s\W]+?)({{\/\2}})/gm
  }

  static swapParamsForTagsRE() {
    return /({{)(.*?)(}})/gm
  }

  removeThis() {
    if (this !== undefined) {
      this.finalArr = undefined
      this.templateData = undefined
      this.template = undefined
    }
  }

  /**
   *
   * @desc Returns a document fragment generated from the template and any added data.
   */

  renderDocFrag() {
    let html = DomElementTemplate.replaceImgPath(this.finalArr.join(''))
    // html = sanitizeHTML(this.finalArr.join(''))
    if (this.testMode !== true) {
      html = sanitizeHTML(html)
    }
    const isTableSubTag =   /^([^>]*?)(<){1}(\b)(thead|col|colgroup|tbody|td|tfoot|tr|th)(\b)([^\0]*)$/.test(html)
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

  parseTheTmplLoop(str, p1, p2, p3) {
    // const dotConverter = str => `${str.replace(/(\.)/g, '][')}`
    const reDot = /(\.)/gm
    const subStr = p3

    /*     const dataReducer = (acc, str) => {
      acc = acc[str]
      return acc
    } */

    let elData = DomElementTemplate.getNestedDataReducer(this.templateData, p2)

    const arrayStringToObjAdapter = (d, str, i) => {
      // IF {{.}} RUN parseString
      if (DomElementTemplate.isPrimitiveTag(str)) {
        return parseString(d, str, i)
      }

      // CREATE DATA OBJ -- CHECK TO ADD PROXY VALUES
      const createDataObj = () => {
        const spyneLoopKey = d
        const loopIndex = i
        const loopNum = i + 1

        if (this.isProxyData) {
          const __cms__dataId = elData.__cms__dataId
          const keyIdStr = `__cms__keyFor_${d}`
          const origKey = elData[keyIdStr]
          return { spyneLoopKey, __cms__dataId, origKey, loopIndex, loopNum, d }
        }
        return { spyneLoopKey, loopIndex, loopNum }
      }

      return parseObject(createDataObj(), str, i)
    }

    const parseString = (item, str, index, origIndex) => {
      item = item.replace(/\$/g, '$$$$') // $ → $$
      return str.replace(DomElementTemplate.swapParamsForTagsRE(), item)
    }

    // PARSING ARRAYS AND OBJECTS
    const parseObject = (obj, str, i) => {
      /// LOOP NUMBER VALUES AUTO ADDED

      // const loopIndex = i;
      // const loopNum = i+1;

      const loopObj = (str, p1, p2) => {
        // DOT SYNTAX CHECK
        const hash = {
          loopIndex: i,
          loopNum: i + 1
        }

        // IF {{.}}
        if (reDot.test(p2) === false && obj[p2] !== undefined) {
          return hash[p2] !== undefined ? hash[p2] : obj[p2]
        }

        const dataReducedVal  = this.getDataValFromPathStr(p2, obj)
        return hash[p2] !== undefined ? hash[p2] : dataReducedVal
      }
      return str.replace(DomElementTemplate.swapParamsForTagsRE(), loopObj)
    }

    const mapStringData = (d, i) => typeof (d) === 'string' ? arrayStringToObjAdapter(d, subStr, i) : parseObject(d, subStr, i)

    if (isNil(elData) === true || isEmpty(elData)) {
      return ''
    }

    if (elData.length === undefined) {
      elData = [elData]
    }

    // convert to array if is string
    elData = Array.isArray(elData) ? elData : [elData]

    return elData.map(mapStringData).join('')
  }
}
