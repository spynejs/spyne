const R = require('ramda');

export class DomTemplateRenderer {
  constructor(template, data) {
    this.template = this.formatTemplate(template);
    this.templateData = data;

    let strArr = DomTemplateRenderer.getStringArray(this.template);

    let strMatches = this.template.match(DomTemplateRenderer.findTmplLoopsRE());
    strMatches = strMatches === null ? [] : strMatches;

    const mapTmplLoop = (str, data) => str.replace(
      DomTemplateRenderer.parseTmplLoopsRE(),
      this.parseTheTmplLoop.bind(this));
    const findTmplLoopsPred = R.contains(R.__, strMatches);

    const checkForMatches = R.ifElse(
      findTmplLoopsPred,
      mapTmplLoop,
      this.addParams.bind(this));

    this.finalArr = strArr.map(checkForMatches);
  }

  static getStringArray(template) {
    let strArr = template.split(DomTemplateRenderer.findTmplLoopsRE());
    const emptyRE = /^([\\n\s\W]+)$/;
    const filterOutEmptyStrings = s => s.match(emptyRE);
    return R.reject(filterOutEmptyStrings, strArr);
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

  getTemplateNode() {
    const html = this.finalArr.join(' ');
    const el = document.createRange().createContextualFragment(html);
    window.setTimeout(this.removeThis(), 10);
    return el;
  }

  getTemplateString() {
    return this.finalArr.join(' ');
  }

  formatTemplate(template) {
    return typeof (template) === 'string' ? template : template.text;
  }

  addParams(str) {
    const replaceTags = (str, p1, p2, p3) => {
      let dataVal = this.templateData[p2];
      let defaultIsEmptyStr = R.defaultTo('');
      return defaultIsEmptyStr(dataVal);
    };

    return str.replace(DomTemplateRenderer.swapParamsForTagsRE(), replaceTags);
  }

  parseTheTmplLoop(str, p1, p2, p3) {
    const subStr = p3;
    let elData = this.templateData[p2];
    const parseString = (item, str) => {
      return str.replace(DomTemplateRenderer.swapParamsForTagsRE(), item);
    };
    const parseObject = (obj, str) => {
      const loopObj = (str, p1, p2) => {
        return obj[p2];
      };
      return str.replace(DomTemplateRenderer.swapParamsForTagsRE(), loopObj);
    };
    const mapStringData = (d) => {
      if (typeof (d) === 'string') {
        d = parseString(d, subStr);
      } else {
        d = parseObject(d, subStr);
      }
      return d;
    };
    if (R.isNil(elData)===true || R.isEmpty(elData)){
      return '';
    }
    return elData.map(mapStringData).join(' ');
  }
}
