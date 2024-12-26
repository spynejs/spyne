
module.exports = {
  "extends": "standard",

  "globals": {
    "requestAnimationFrame" : true
  },


  /*    "plugins": [
          "standard",
          "promise"
      ],
      */
  "rules": {
    "key-spacing": [0, { "beforeColon": false, "afterColon": true }],
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "never"
    }],
    'no-new': 'off',
    'camelcase': 'off',
    "no-unused-vars": ["error", { "caughtErrors": "none", "args": "none" }],
    "arrow-spacing": ["error", { "before": true, "after": true }],
    "no-return-assign": ["error", "except-parens"],
    "no-multi-spaces": ["error", { exceptions: { "VariableDeclarator": true } }]
    /*"class-methods-use-this": ["error", { "exceptMethods": ["foo"] }]*/
  }
};
