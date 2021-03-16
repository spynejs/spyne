import {path, assocPath} from 'ramda';

export function createElement(tagName = 'div') {
  return document.createElement(tagName);
}
export function setData(data = {}) {
  return data;
}
export function addAttributes(el, attrs = {}) {
}


export function testDomTemplateForTableTags(HTMLStr){
  //const reFromConfig = path(pathArr, window)

  const addREToConfig = function(){
    const tableRE = /^([^>]*?)(<){1}(\b)(thead|col|colgroup|tbody|td|tfoot|tr|th)(\b)([^\0]*)$/;
    const pathArr = ['Spyne', 'config', 'utils', 'tableRE'];

    if (window){
      assocPath(pathArr, tableRE, window);
    }
    return tableRE;
  }
  const re = window.Spyne.config.utils['tableRE'] || addREToConfig();
  return re.test(HTMLStr)

}







export function testDomTemplateForTableTags5(HTMLStr){
  const pathArr = ['Spyne', 'config', 'utils', 'tableRE'];
  const reFromConfig = path(pathArr, window)

  const addREToConfig = function(){
    const tableRE = /^([^>]*?)(<){1}(\b)(thead|col|colgroup|tbody|td|tfoot|tr|th)(\b)([^\0]*)$/;

    if (window){
      assocPath(pathArr, tableRE, window);
    }
    return tableRE;
  }
  const re = reFromConfig ? reFromConfig : addREToConfig();
  return re.test(HTMLStr)

}
