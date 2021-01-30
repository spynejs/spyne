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
              'routeName': 'itemId',
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


const reduceProcessedRouteData = {
  "type": "slash",
  "isHash": false,
  "isHidden": false,
  'add404s': true,
  'routes': {
    'routePath': {
      'routeName': 'pageId',
      'home': '^$',
      'work': {
        'routePath': {
          'routeName': 'topicId',
          'portfolio': 'portfolio',
          'services': 'services',
          'items-*': {
            'routePath': {
              'routeName': 'itemId',
              'contact': 'contact',
              "base" : "base"
            },
          },
        },
      },
      'about': {
        'routePath': {
          'routeName': 'topicId',
          'contact': 'smith',
        },
      },
    },
  },
};

const reducedRoutesArr = [
  {
    "pageId": "home",
    "text": "HOME",
    "href": "/",
    "nav-level": 1
  },
  {
    "pageId": "work",
    "topicId": "",
    "nav-level": 1,
    "text": "WORK",
    "href": "/work"
  },
  {
    "pageId": "work",
    "topicId": "services",
    "text": "SERVICES",
    "href": "/work/services",
    "nav-level": 2
  },
  {
    "pageId": "work",
    "topicId": "portfolio",
    "text": "PORTFOLIO",
    "href": "/work/portfolio",
    "nav-level": 2
  },
  {
    "pageId": "work",
    "topicId": "blog",
    "text": "BLOG",
    "href": "/work/blog",
    "nav-level": 2
  },
  {
    "pageId": "work",
    "topicId": "items",
    "itemId": "contact",
    "text": "CONTACT",
    "href": "/work/items/contact",
    "nav-level": 3
  },
  {
    "pageId": "work",
    "topicId": "items",
    "itemId": "base",
    "text": "BASE",
    "href": "/work/items/",
    "nav-level": 3
  },
  {
    "pageId": "about",
    "topicId": "",
    "nav-level": 1,
    "text": "ABOUT",
    "href": "/about"
  },
  {
    "pageId": "about",
    "topicId": "contact",
    "text": "CONTACT",
    "href": "/about/smith",
    "nav-level": 2
  }
]

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
              'routeName': 'itemId',
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

module.exports = {postProcessedRouteData,reducedRoutesArr, preProcessedRouteData,reduceProcessedRouteData, mainConfigPreProcessedData, mainConfigPostProcessedData};
