/* global PDFJS */
import Ember from 'ember'
import layout from '../templates/components/pdf-js'

const {
  PDFFindController,
  PDFHistory,
  PDFLinkService,
  PDFViewer
} = PDFJS

const {
  Component,
  computed: { reads },
  inject: { service: injectService },
  observer,
  run
} = Ember

function scrollToMatch (pdfViewer, match) {
  let { pageIdx, matchIdx } = match
  let page = pdfViewer.getPageView(pageIdx)
  let { textLayer } = page
  if (!textLayer) {
    // Ember.Logger.debug(`page ${pageIdx} not ready`)
    page.div.scrollIntoView()
    run.later(() => {
      // Ember.Logger.debug('re-running scrollToMatch')
      scrollToMatch(pdfViewer, match)
    }, 50)
  } else {
    // Ember.Logger.debug('ready to scroll right to the match')
    if (!textLayer.textContent) {
      // Ember.Logger.debug('textLayer.textContent ', textLayer.textContent)
      // Ember.Logger.debug('page->', page)
      run.later(() => {
        // Ember.Logger.debug('re-running scrollToMatch')
        scrollToMatch(pdfViewer, match)
      }, 50)
    } else {
      let [{ begin: { divIdx } }] = textLayer.convertMatches([matchIdx], [1])
      textLayer.textDivs[divIdx].scrollIntoView()
      // debugger
    }
  }
}

export default Component.extend({
  layout,
  classNames: [ 'pdf-js' ],
  // Service
  pdfJs: injectService('pdf-js'),
  pdfLib: reads('pdfJs.PDFJS'),

  // inputs
  pdf: undefined,

  // variables
  loadingTask: undefined,
  percentLoaded: 0,
  pdfDocument: undefined,
  pdfLinkService: undefined,
  pdfHistory: undefined,
  pdfViewer: undefined,
  pdfFindController: undefined,
  pdfPage: undefined,
  pdfTotalPages: undefined,
  currentMatch: undefined,
  currentMatchIdx: undefined,
  matchTotal: undefined,

  // privates
  _topMargin: 10,
  _container: undefined,

  // components
  toolbarComponent: 'pdf-js-toolbar',

  // initialization
  didInsertElement () {
    let [container] = this.element.getElementsByClassName('pdfViewerContainer')
    this.set('_container', container)
    let pdfLinkService = new PDFLinkService()
    this.set('pdfLinkService', pdfLinkService)
    let pdfViewer = new PDFViewer({
      container,
      linkService: pdfLinkService
    })
    this.set('pdfViewer', pdfViewer)
    pdfLinkService.setViewer(pdfViewer)
    let pdfHistory = new PDFHistory({
      linkService: pdfLinkService
    })
    this.set('pdfHistory', pdfHistory)
    pdfLinkService.setHistory(pdfHistory)
    let pdfFindController = new PDFFindController({
      pdfViewer
    })
    this.set('pdfFindController', pdfFindController)
    // Ember.Logger.debug('pdfFindController -> ', pdfFindController)
    // Ember.Logger.debug('pdfViewer -> ', pdfViewer)
    pdfViewer.setFindController(pdfFindController)
    pdfViewer.currentScaleValue = 'page-fit'

    // setup the event listening to synchronise with pdf.js' modifications
    let self = this
    pdfViewer.eventBus.on('pagechange', function (evt) {
      let page = evt.pageNumber
      run(function () {
        self.set('pdfPage', page)
      })
    })

    pdfFindController.onUpdateResultsCount = function (total) {
      run(function () {
        self.set('matchTotal', total)
      })
    }
    pdfFindController.onUpdateState = function (state, previous, total) {
      run(function () {
        if (state !== 0 && state !== 2) { // 0 <=> search found something ; 2 <=> wrapped
          return
        }
        let { pageIdx, matchIdx } = pdfFindController.selected
        if (matchIdx !== -1 || pageIdx !== -1) {
          let { pageMatches } = pdfFindController
          let idx = matchIdx + 1
          for (let i = 0; i < pageIdx; i++) {
            idx += pageMatches[i].length
          }
          let match = pdfFindController.pageMatches[pageIdx][matchIdx]
          self.set('currentMatch', match)
          self.set('currentMatchIdx', idx)
        }
      })
    }

    if (this.get('pdf')) {
      this.send('load')
    }
  },

  // observer
  pdfObserver: observer('pdf', function () {
    this.send('load')
  }),

  // actions:
  actions: {
    load () {
      let uri = this.get('pdf')
      let loadingTask = this.get('pdfLib').getDocument(uri)
      loadingTask.onProgress = (progressData) => {
        this.set('percentLoaded', 100 * progressData.loaded / progressData.total)
      }

      loadingTask = loadingTask.then((pdfDocument) => {
        this.set('pdfDocument', pdfDocument)
        let viewer = this.get('pdfViewer')
        viewer.setDocument(pdfDocument)
        let linkService = this.get('pdfLinkService')
        linkService.setDocument(pdfDocument)
        let history = this.get('pdfHistory')
        history.initialize(pdfDocument.fingerprint)
        this.set('pdfTotalPages', linkService.pagesCount)
        this.set('pdfPage', linkService.page)
        this.sendAction('documentChanged', pdfDocument)
      })

      this.set('loadingTask', loadingTask)
      return loadingTask
    },
    search (query, highlightAll, caseSensitive, phraseSearch) {
      let pdfFindController = this.get('pdfFindController')
      pdfFindController.executeCommand('find', {
        query,
        highlightAll,
        caseSensitive,
        phraseSearch
      })
    },
    changeSearchResult (changeDirection) {
      let pdfFindController = this.get('pdfFindController')
      if (!pdfFindController.state) {
        return // there is no search going on so let's ignore that call
      }
      switch (changeDirection) {
        case 'prev':
          pdfFindController.state.findPrevious = true
          pdfFindController.nextMatch()
          break
        case 'next':
          pdfFindController.state.findPrevious = false
          pdfFindController.nextMatch()
          break
        default:
          return
      }
      scrollToMatch(this.get('pdfViewer'), pdfFindController.selected)
    },
    changePage (changePage) {
      let pdfLinkService = this.get('pdfLinkService')
      switch (changePage) {
        case 'prev':
          pdfLinkService.page--
          break
        case 'next':
          pdfLinkService.page++
          break
        default:
          // regular change of page:
          pdfLinkService.page = Number.parseInt(changePage)
      }
      let pdfViewer = this.get('pdfViewer')
      pdfViewer.getPageView(pdfLinkService.page - 1).div.scrollIntoView()
    },
    zoom () {
      throw 'not implemented yet'
    }
  }

})
