const mainConfigPostProcessedData = {
  "scrollLock": false,
  "scrollLockX": 0,
  "scrollLockY": 0,
  "debug": true,
  "channels": {
    "WINDOW": {
      "mediqQueries": {
        "showMenuDrawer": "(max-width: 768px)"
      },
      "events": [
        "beforeunload"
      ],
      "listenForResize": true,
      "listenForOrientation": true,
      "listenForScroll": true,
      "listenForMouseWheel": false,
      "debounceMSTimeForResize": 200,
      "debounceMSTimeForScroll": 50,
      "listenForMediaQueries": true
    },
    "ROUTE": {
      "type": "slash",
      "isHash": false,
      "isHidden": false,
      "add404s" : true,
      "routes": {
        "routePath": {
          "404": ".+",
          "routeName": "pageId",
          "home": "^$",
          "work": {
            "routePath": {
              "404": ".+",
              "routeName": "topicId",
              "services": "services",
              "portfolio": "portfolio",
              "blog": "blog"
            }
          },
          "about": {
            "routePath": {
              "404": ".+",
              "routeName": "topicId",
              "contact": "contact"
            }
          }
        }
      },
      "paramsArr": [
        ".+",
        "pageId",
        "^$",
        ".+",
        "topicId",
        "services",
        "portfolio",
        "blog",
        ".+",
        "topicId",
        "contact"
      ]
    }
  },
  "siteTitle": "Acme Co.",
  "localStorageKey": "spaGenStore",
  "appTitles": {
    "header": "Your Title",
    "footer": "Your Footer Text"
  }
}
const mainConfigPreProcessedData = {
  "scrollLock": false,
  "scrollLockX": 0,
  "scrollLockY": 0,
  "debug": true,
  "channels": {
    "WINDOW": {
      "mediqQueries": {
        "showMenuDrawer": "(max-width: 768px)"
      },
      "events": [
        "beforeunload"
      ],
      "listenForResize": true,
      "listenForOrientation": true,
      "listenForScroll": true,
      "listenForMouseWheel": false,
      "debounceMSTimeForResize": 200,
      "debounceMSTimeForScroll": 50,
      "listenForMediaQueries": true
    },
    "ROUTE": {
      "type": "slash",
      "isHash": false,
      "isHidden": false,
      "add404s" : true,
      "routes": {
        "routePath": {
          "routeName": "pageId",
          "home": "",
          "work": {
            "routePath": {
              "404": ".+",
              "routeName": "topicId",
              "services": "services",
              "portfolio": "portfolio",
              "blog": "blog"
            }
          },
          "about": {
            "routePath": {
              "404": ".+",
              "routeName": "topicId",
              "contact": "contact"
            }
          }
        }
      },
      "paramsArr": [
        ".+",
        "pageId",
        "^$",
        ".+",
        "topicId",
        "services",
        "portfolio",
        "blog",
        ".+",
        "topicId",
        "contact"
      ]
    }
  },
  "siteTitle": "Acme Co.",
  "localStorageKey": "spaGenStore",
  "appTitles": {
    "header": "Your Title",
    "footer": "Your Footer Text"
  }
}


const postProcessedRouteData = {
  'type': 'slash',
  'isHash': false,
  'isHidden': false,
  'add404s': true,
  'routes': {
    'routePath': {
      '404': '.+',
      'routeName': 'pageId',
      'home': '^$',
      'work': {
        'routePath': {
          '404': '.+',
          'routeName': 'topicId',
          'services': 'services',
          'portfolio': 'portfolio',
          'blog': 'blog',
          'items': {
            'routePath': {
              '404': '.+',
              'routeName': 'topicId',
              'contact': 'contact',
              "base" : "^$"
            },
          },
        },
      },
      'about': {
        'routePath': {
          '404': '.+',
          'routeName': 'topicId',
          'contact': 'smith|jane|john',
        },
      },
    },
  },
};

const preProcessedRouteData = {
  'type': 'slash',
  'isHash': false,
  'isHidden': false,
  'add404s': true,
  'routes': {
    'routePath': {
      'routeName': 'pageId',
      'home': '',
      'work': {
        'routePath': {
          'routeName': 'topicId',
          'services': 'services',
          'portfolio': 'portfolio',
          'blog': 'blog',
          'items': {
            'routePath': {
              'routeName': 'topicId',
              'contact': 'contact',
              "base" : ""
            },
          },
        },
      },
      'about': {
        'routePath': {
          '404': '.+',
          'routeName': 'topicId',
          'contact': ['smith', 'jane', 'john'],
        },
      },
    },
  },
};

module.exports = {postProcessedRouteData, preProcessedRouteData, mainConfigPreProcessedData, mainConfigPostProcessedData};
