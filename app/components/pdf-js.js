/* global PDFJS */
import Ember from 'ember'
import layout from '../templates/components/pdf-js'

const {
  PDFLinkService,
  PDFViewer,
  PDFHistory
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

  // initialization
  didInsertElement () {
    let pdfLinkService = new PDFLinkService()
    this.set('pdfLinkService', pdfLinkService)
    let pdfViewer = new PDFViewer({
      container: this.element,
      linkService: pdfLinkService
    })
    this.set('pdfViewer', pdfViewer)
    pdfLinkService.setViewer(pdfViewer)
    let pdfHistory = new PDFHistory({
      linkService: pdfLinkService
    })
    this.set('pdfHistory', pdfHistory)

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
      this.set('loadingTask', loadingTask)
      loadingTask.onProgress = (progressData) => {
        this.set('percentLoaded', 100 * progressData.loaded / progressData.total)
      }

      return loadingTask.then((pdfDocument) => {
        Ember.Logger.debug('pdfDocument loaded -> ', pdfDocument)
        this.set('pdfDocument', pdfDocument)
        let viewer = this.get('pdfViewer')
        viewer.setDocument(pdfDocument)
        let linkService = this.get('pdfLinkService')
        linkService.setDocument(pdfDocument)
        let history = this.get('pdfHistory')
        history.initialize(pdfDocument.fingerprint)
      })
    }
  }

})
