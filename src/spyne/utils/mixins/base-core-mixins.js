export function baseCoreMixins() {
  return {
    createpropsMap: function() {
      const wm = new WeakMap()
      const objKey = { vsid: this.props.vsid }
      wm.set(objKey, this.props)
      return {
        key: objKey,
        weakMap: wm
      }
    },
    gc: function() {
      for (const m in this) {
        delete this[m]
      }
      delete this
    },
    createId: function() {
      // let num = Math.floor(Math.random(10000000) * 10000000);
      // const num = () => Math.random().toString(36).substring(2, 8);;
      const num = () => Math.random().toString(36).replace(/\d/gm, '').substring(1, 8)
      return num()
      // return `vsid-${num()}`;
    },
    setTraceFunc: function(debug) {
      return debug === true
        ? console.log
        : () => {
          }
    }
  }
}
