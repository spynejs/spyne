const SpyneConfigData = {

  channels: {
    WINDOW: {
      mediqQueries: {
        'test' : '(max-width: 500px)',
        'newTest' : '(max-width: 800px)'
      },
      listenForResize: true,
      listenForOrientation: true,
      listenForScroll: true,
      listenForMouseWheel: false
    },

    ROUTE: {
      paramsArr: ['pageId', '', 'imageNum', 'author', 'photogNum'],
      type: 'slash', /* "slash", "query" */
      isHash: false,
      isHidden: true,
      routes: {
        'route': {
          'keyword': 'pageId',
          'home': '',
          'page-one': {
            'route': {
              'keyword': 'imageNum',
              'route': {
                'keyword': 'author'
              }
            }
          },
          'page-two': {
            'route': {
              'keyword': 'photogNum'
            }
          },
          'page-.*': {
            'route': {
              'keyword': 'randomNum'
            }
          }
        }

      }

    }
  }

};

const RouteDataForTests = {

  multiple: {

    data: {
      'pageId': 'page-one',
      'imageNum': '2',
      'author': 'ubalu'
    },
    arr: '[{"pageId":"page-one"},{"imageNum":"2"},{"author":"ubalu"}]',
    slash: 'page-one/2/ubalu',
    hash: '#page-one/2/ubalu',
    query: '?pageId=page-one&imageNum=2&author=ubalu'

  },
  multipleRegex: {

    data: {
      'pageId': 'page-three',
      'randomNum': '2'
    },
    arr: '[{"pageId":"page-three"},{"randomNum":"2"}]',
    slash: 'page-three/2',
    hash: '#page-three/2',
    query: '?pageId=page-three&randomNum=2'

  },

  multipleWrong: {

    data: {
      'pageId': 'page-four',
      'imageNum': '2',
      'author': 'ubalu'
    },
    arr: '[{"pageId":"page-one"},{"imageNum":"2"},{"author":"ubalu"}]',
    slash: 'page-one/2/ubalu',
    hash: '#page-one/2/ubalu',
    query: '?pageId=page-one&imageNum=2&author=ubalu'

  },

  singleBasic: {

    data: {
      'pageId': 'page-two'
    },
    arr: '[{"pageId":"page-two"}]',
    slash: 'page-two',
    hash: '#page-two',
    query: '?pageId=page-two'

  },

  single: {

    data: {
      'pageId': 'page-two',
      'imageNum': '2'
    },
    arr: '[{"pageId":"page-two"}]',
    slash: 'page-two',
    hash: '#page-two',
    query: '?pageId=page-two'

  },
  home: {

    data: {
      'pageId': 'home'
    },
    arr: [],
    slash: '',
    hash: '',
    query: ''

  },

  empty: {

    data: {},
    arr: [],
    slash: '',
    hash: '',
    query: ''

  }

};

const ViewStreamHashMethodsObj = {
  'DISPOSING':     () => {},
  'DISPOSE':     () => {},
  'RENDERED':     () => {},
  'RENDERED_AND_ATTACHED_TO_WINDOW':     () => {},
  'RENDERED_AND_ATTACHED_TO_PARENT':     () => {},
  'READY_FOR_GC':     () => {},
  'NOTHING':     () => {},
  'CHANNEL_ROUTE_CHANGE_EVENT':    () => {},
  'UI_EVENT_BLUR':     () => {},
  'UI_EVENT_.*':     () => {},
  'UI_EVENT_CLICK':     () => {},
  'UI_EVENT_DBLCLICK': () => {}
};

export {SpyneConfigData, RouteDataForTests, ViewStreamHashMethodsObj};
