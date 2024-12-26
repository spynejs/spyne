const mainConfigPostProcessedData = {
  scrollLock: false,
  scrollLockX: 0,
  scrollLockY: 0,
  debug: true,
  channels: {
    WINDOW: {
      mediaQueries: {
        showMenuDrawer: '(max-width: 768px)'
      },
      events: [
        'beforeunload'
      ],
      listenForResize: true,
      listenForOrientation: true,
      listenForScroll: true,
      listenForMouseWheel: false,
      debounceMSTimeForResize: 200,
      debounceMSTimeForScroll: 50,
      listenForMediaQueries: true
    },
    ROUTE: {
      type: 'slash',
      isHash: false,
      isHidden: false,
      add404s : true,
      routes: {
        routePath: {
          404: '.+',
          routeName: 'pageId',
          home: '^$',
          work: {
            routePath: {
              404: '.+',
              routeName: 'topicId',
              services: 'services',
              portfolio: 'portfolio',
              blog: 'blog'
            }
          },
          about: {
            routePath: {
              404: '.+',
              routeName: 'topicId',
              contact: 'contact'
            }
          }
        }
      },
      paramsArr: [
        '.+',
        'pageId',
        '^$',
        '.+',
        'topicId',
        'services',
        'portfolio',
        'blog',
        '.+',
        'topicId',
        'contact'
      ]
    }
  },
  siteTitle: 'Acme Co.',
  localStorageKey: 'spaGenStore',
  appTitles: {
    header: 'Your Title',
    footer: 'Your Footer Text'
  }
}
const mainConfigPreProcessedData = {
  scrollLock: false,
  scrollLockX: 0,
  scrollLockY: 0,
  debug: true,
  channels: {
    WINDOW: {
      mediaQueries: {
        showMenuDrawer: '(max-width: 768px)'
      },
      events: [
        'beforeunload'
      ],
      listenForResize: true,
      listenForOrientation: true,
      listenForScroll: true,
      listenForMouseWheel: false,
      debounceMSTimeForResize: 200,
      debounceMSTimeForScroll: 50,
      listenForMediaQueries: true
    },
    ROUTE: {
      type: 'slash',
      isHash: false,
      isHidden: false,
      add404s : true,
      routes: {
        routePath: {
          routeName: 'pageId',
          home: '',
          work: {
            routePath: {
              404: '.+',
              routeName: 'topicId',
              services: 'services',
              portfolio: 'portfolio',
              blog: 'blog'
            }
          },
          about: {
            routePath: {
              404: '.+',
              routeName: 'topicId',
              contact: 'contact'
            }
          }
        }
      },
      paramsArr: [
        '.+',
        'pageId',
        '^$',
        '.+',
        'topicId',
        'services',
        'portfolio',
        'blog',
        '.+',
        'topicId',
        'contact'
      ]
    }
  },
  siteTitle: 'Acme Co.',
  localStorageKey: 'spaGenStore',
  appTitles: {
    header: 'Your Title',
    footer: 'Your Footer Text'
  }
}

const postProcessedRouteData = {
  type: 'slash',
  isHash: false,
  isHidden: false,
  add404s: true,
  routes: {
    routePath: {
      404: '.+',
      routeName: 'pageId',
      home: '^$',
      work: {
        routePath: {
          404: '.+',
          routeName: 'topicId',
          services: 'services',
          portfolio: 'portfolio',
          blog: 'blog',
          items: {
            routePath: {
              404: '.+',
              routeName: 'itemId',
              contact: 'contact',
              base : '^$'
            }
          }
        }
      },
      about: {
        routePath: {
          404: '.+',
          routeName: 'topicId',
          contact: 'smith|jane|john'
        }
      }
    }
  }
}

const reduceProcessedRouteData = {
  type: 'slash',
  isHash: false,
  isHidden: false,
  add404s: true,
  routes: {
    routePath: {
      routeName: 'pageId',
      home: '^$',
      work: {
        routePath: {
          routeName: 'topicId',
          portfolio: 'portfolio',
          services: 'services',
          'items-*': {
            routePath: {
              routeName: 'itemId',
              contact: 'contact',
              base : 'base'
            }
          }
        }
      },
      about: {
        routePath: {
          routeName: 'topicId',
          contact: 'smith'
        }
      }
    }
  }
}

const reducedRoutesArr = [
  {
    pageId: 'home',
    title: 'HOME',
    href: '/',
    navLevel: 1
  },
  {
    pageId: 'work',
    topicId: '',
    navLevel: 1,
    title: 'WORK',
    href: '/work'
  },
  {
    pageId: 'work',
    topicId: 'services',
    title: 'SERVICES',
    href: '/work/services',
    navLevel: 2
  },
  {
    pageId: 'work',
    topicId: 'portfolio',
    title: 'PORTFOLIO',
    href: '/work/portfolio',
    navLevel: 2
  },
  {
    pageId: 'work',
    topicId: 'blog',
    title: 'BLOG',
    href: '/work/blog',
    navLevel: 2
  },
  {
    pageId: 'work',
    topicId: 'items',
    itemId: 'contact',
    title: 'CONTACT',
    href: '/work/items/contact',
    navLevel: 3
  },
  {
    pageId: 'work',
    topicId: 'items',
    itemId: 'base',
    title: 'BASE',
    href: '/work/items/',
    navLevel: 3
  },
  {
    pageId: 'about',
    topicId: '',
    navLevel: 1,
    title: 'ABOUT',
    href: '/about'
  },
  {
    pageId: 'about',
    topicId: 'contact',
    title: 'CONTACT',
    href: '/about/smith',
    navLevel: 2
  }, {
    bioId: '',
    href: '/bio-',
    navLevel: 1,
    pageId: 'bio-',
    title: 'bio-.*'
  },
  {
    bioId: 'bioLastName',
    href: '/bio-/',
    navLevel: 2,
    pageId: 'bio-',
    title: 'BIOLASTNAME'
  }
]

const preProcessedRouteData = {
  type: 'slash',
  isHash: false,
  isHidden: false,
  add404s: true,
  routes: {
    routePath: {
      routeName: 'pageId',
      home: '',
      work: {
        routePath: {
          routeName: 'topicId',
          services: 'services',
          portfolio: 'portfolio',
          blog: 'blog',
          items: {
            routePath: {
              routeName: 'itemId',
              contact: 'contact',
              base : ''
            }
          }
        }
      },
      about: {
        routePath: {
          404: '.+',
          routeName: 'topicId',
          contact: ['smith', 'jane', 'john']
        }
      }
    }
  }
}

module.exports = { postProcessedRouteData, reducedRoutesArr, preProcessedRouteData, reduceProcessedRouteData, mainConfigPreProcessedData, mainConfigPostProcessedData }
