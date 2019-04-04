import {includes, __, ifElse, reject, is, defaultTo, isNil, isEmpty} from 'ramda';

/**
 * @module DomItemTemplate
 * @constructor
 * @param {String|HTMLElement} template
 * @param {Object} data
 *
 * @desc DomItem uses this class when rendering templates.
 */

export class DomItemTemplate {
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

    let strArr = DomItemTemplate.getStringArray(this.template);

    let strMatches = this.template.match(DomItemTemplate.findTmplLoopsRE());
    strMatches = strMatches === null ? [] : strMatches;

    const mapTmplLoop = (str, data) => str.replace(
      DomItemTemplate.parseTmplLoopsRE(),
      this.parseTheTmplLoop.bind(this));
    const findTmplLoopsPred = includes(__, strMatches);

    const checkForMatches = ifElse(
      findTmplLoopsPred,
      mapTmplLoop,
      this.addParams.bind(this));

    this.finalArr = strArr.map(checkForMatches);
  }

  static getStringArray(template) {
    let strArr = template.split(DomItemTemplate.findTmplLoopsRE());
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
  getTemplateNode() {
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
      let dataVal = this.templateData[p2];
      let defaultIsEmptyStr = defaultTo('');
      return defaultIsEmptyStr(dataVal);
    };

    return str.replace(DomItemTemplate.swapParamsForTagsRE(), replaceTags);
  }

  parseTheTmplLoop(str, p1, p2, p3) {
    const subStr = p3;
    let elData = this.templateData[p2];
    const parseString = (item, str) => {
      return str.replace(DomItemTemplate.swapParamsForTagsRE(), item);
    };
    const parseObject = (obj, str) => {
      const loopObj = (str, p1, p2) => {
        return obj[p2];
      };
      return str.replace(DomItemTemplate.swapParamsForTagsRE(), loopObj);
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
    return elData.map(mapStringData).join('');
  }
}
