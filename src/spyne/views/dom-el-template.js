import {includes, __, ifElse, compose,path,split, reject, is, defaultTo, isNil, isEmpty} from 'ramda';

/**
 * @module DomElTemplate
 * @type internal
 *
 * @constructor
 * @param {String|HTMLElement} template
 * @param {Object} data
 *
 * @desc DomEl uses this class when rendering templates.
 */

export class DomElTemplate {
  constructor(template, data) {
    this.template = this.formatTemplate(template);

    const checkForArrayData = ()=>{
      if (is(Array, data) === true) {
        data = {spyneData:data};
        this.template = this.template.replace("{{/}}", "{{/spyneData}}");
        this.template = this.template.replace("{{#}}", "{{#spyneData}}");
      }
    };

    checkForArrayData();


    this.templateData = data;

    let strArr = DomElTemplate.getStringArray(this.template);

    let strMatches = this.template.match(DomElTemplate.findTmplLoopsRE());
    strMatches = strMatches === null ? [] : strMatches;

    const mapTmplLoop = (str, data) => str.replace(
      DomElTemplate.parseTmplLoopsRE(),
      this.parseTheTmplLoop.bind(this));
    const findTmplLoopsPred = includes(__, strMatches);

    const checkForMatches = ifElse(
      findTmplLoopsPred,
      mapTmplLoop,
      this.addParams.bind(this));

    this.finalArr = strArr.map(checkForMatches);
  }

  static getStringArray(template) {
    let strArr = template.split(DomElTemplate.findTmplLoopsRE());
    const emptyRE = /^([\\n\s\W]+)$/;
    const filterOutEmptyStrings = s => s.match(emptyRE);
    return reject(filterOutEmptyStrings, strArr);
  }

  static findTmplLoopsRE() {
    return /({{#\w+}}[\w\n\s\W]+?{{\/\w+}})/gm;
  }

  static parseTmplLoopsRE() {
    return /({{#(\w+)}})([\w\n\s\W]+?)({{\/\2}})/gm;
  }

  static swapParamsForTagsRE() {
    return /({{)(.*?)(}})/gm;
  }

  removeThis() {
    this.finalArr = undefined;
    this.templateData = undefined;
    this.template = undefined;
  }


    /**
     *
     * @desc Returns a document fragment generated from the template and any added data.
     */
  renderDocFrag() {
    const html = this.finalArr.join('');
    const el = document.createRange().createContextualFragment(html);
    window.setTimeout(this.removeThis(), 10);
    return el;
  }

  getTemplateString() {
    return this.finalArr.join('');
  }

  formatTemplate(template) {
    return typeof (template) === 'string' ? template : template.text;
  }

  addParams(str) {
    const replaceTags = (str, p1, p2, p3) => {
      let dataVal = compose(path(__, this.templateData), split('.'))(p2);
      let defaultIsEmptyStr = defaultTo('');
      return defaultIsEmptyStr(dataVal);
    };

    return str.replace(DomElTemplate.swapParamsForTagsRE(), replaceTags);
  }

  parseTheTmplLoop(str, p1, p2, p3) {
    const subStr = p3;
    let elData = this.templateData[p2];
    const parseString = (item, str) => {
      return str.replace(DomElTemplate.swapParamsForTagsRE(), item);
    };
    const parseObject = (obj, str) => {
      const loopObj = (str, p1, p2) => {
        // DOT SYNTAX CHECK
        return compose(path(__, obj), split('.'))(p2);
      };
      return str.replace(DomElTemplate.swapParamsForTagsRE(), loopObj);
    };
    const mapStringData = (d) => {
      if (typeof (d) === 'string') {
        //console.log("MAP STR 1 ",{d, subStr});

        d = parseString(d, subStr);
       // console.log("MAP STR 2",{d, subStr});

      } else {
        d = parseObject(d, subStr);
      }
      return d;
    };
    if (isNil(elData) === true || isEmpty(elData)) {
      return '';
    }

    if (elData.length===undefined) {
          elData = [elData];
      }
      return elData.map(mapStringData).join('');
  }
}
