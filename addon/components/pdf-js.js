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
  observer
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
  pdfPage: 0,

  // components
  toolbarComponent: 'pdf-js-toolbar',

  // initialization
  didInsertElement () {
    let pdfLinkService = new PDFLinkService()
    this.set('pdfLinkService', pdfLinkService)
    let pdfViewer = new PDFViewer({
      container: this.element.getElementsByClassName('pdfViewerContainer')[0],
      linkService: pdfLinkService
    })
    this.set('pdfViewer', pdfViewer)
    pdfLinkService.setViewer(pdfViewer)
    let pdfHistory = new PDFHistory({
      linkService: pdfLinkService
    })
    this.set('pdfHistory', pdfHistory)
    let pdfFindController = new PDFFindController({
      pdfViewer
    })
    this.set('pdfFindController', pdfFindController)
    pdfViewer.setFindController(pdfFindController)

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
