export function BaseViewMixins() {
  return {
    //  ==============================================
    // ATTACH METHODS
    //  ==============================================
    setEl(props) {
      props.el = document.createElement(props.tagName);;
      return props;
    },
    setData(props) {
      let obj = props.el;
      let data = props.data;
      let dataType = typeof(data);
      let dataTypeFunc = {
        'string'      : (data, obj) => obj.innerText = data,
        'object'      : () => {},
        'undefined'   : () => {}
      };
      dataTypeFunc[dataType](data, obj);
      return props;
    },

    addAttributes(props) {
      props.el.setAttribute('id', props.id);
      return props;
    },
    addClassNames(props) {
      if (props.className !== undefined) {
        props.el.classList.add(props.className);
      }
      return props;
    },
    addTemplate(props) {
      if (props.template !== undefined) {
        let data = props.data !== undefined ? props.data : {};
        let htmlStr = props.template(data);
        let html = document.createDocumentFragment(htmlStr);
        props.el.innerHTML = htmlStr;
      }
      return props;
    },

    getSelector(str) {
      return `${this.props.hashId} ${str}`;
    },

    getItemSignature(obj) {
      return `[${obj.id}: ${obj.cid}: ${obj.name}]`;
    },

    getProp(str) {
      return this.props[str] !== undefined ? this.props[str] :
        console.warn('prop does not exist! Called from %s', this.getItemSignature(this.props));
    },

    onReady(props, connectType = 'append',) {
      // PARENT CAN BE A QUERYSELECTOR OR A WINDOW NODE --> SO FIND CORRECT CONNECTOR
      let objConnectType = `${connectType}Child`;
      let parent = props.parent;
      let parentType = typeof(props.parent);
      let parentTypeFunc = {
        string : (chunk) => {document.querySelector(parent)[connectType](chunk)},
        object : (chunk) => {parent[objConnectType](chunk)}
      };
      parentTypeFunc[parentType](props.el);
    },

    fadeout() {
    }
  }

}