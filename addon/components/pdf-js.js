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

export default Component.extend({
  layout,
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

  // components
  toolbarComponent: 'pdf-js-toolbar',

  // initialization
  didInsertElement () {
    let [container] = this.element.getElementsByClassName('pdfViewerContainer')
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
        Ember.Logger.debug('pdfDocument loaded -> ', pdfDocument)
        this.set('pdfDocument', pdfDocument)
        let viewer = this.get('pdfViewer')
        viewer.setDocument(pdfDocument)
        let linkService = this.get('pdfLinkService')
        linkService.setDocument(pdfDocument)
        let history = this.get('pdfHistory')
        history.initialize(pdfDocument.fingerprint)
        this.set('pdfTotalPages', linkService.pagesCount)
        this.set('pdfPage', linkService.page)
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
          pdfLinkService.page = changePage
      }
    },
    zoom () {
      throw 'not implemented yet'
    }
  }

})
