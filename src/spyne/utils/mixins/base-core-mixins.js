export function baseCoreMixins() {
  return {
    createpropsMap: function() {
      let wm = new WeakMap();
      let objKey = { cid: this.props.cid };
      wm.set(objKey, this.props);
      return {
        key: objKey,
        weakMap: wm
      };
    },
    gc: function() {
      for (let m in this) {
        delete this[m];
      }
      delete this;
    },
    createId: function() {
      let num = Math.floor(Math.random(10000000) * 10000000);
      return `cid-${num}`;
    },
    setTraceFunc: function(debug) {
      return debug === true ? console.log : () => {
      };
    }
  };
}
