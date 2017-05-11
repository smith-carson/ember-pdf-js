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
  A,
  Component,
  computed,
  computed: {reads},
  inject: {service: injectService},
  isEmpty,
  observer,
  run
} = Ember

function scrollToMatch (pdfViewer, match) {
  let {pageIdx, matchIdx} = match
  let page = pdfViewer.getPageView(pageIdx)
  let {textLayer} = page
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
      let [{begin: {divIdx}}] = textLayer.convertMatches([matchIdx], [1])
      textLayer.textDivs[divIdx].scrollIntoView()
      // debugger
    }
  }
}

function getResultContextForPage (pdfViewer, pageIdx, currentMatchIdx, pageMatches, searchResultContextLength) {
  let pageTextPromise = pdfViewer.getPageTextContent(pageIdx)
    .then(({items}) => items.map((item) => item.str).join(' '))
  /* this will cause some shifting:
   - we are adding extra space compare to what the findController is doing
   but it is required since some pdf don't add space at the end of their text divs
   and we would end up with some text missing spaces and "lookingLikethat"
   */
  return pageMatches.map((matchIdx, idx) => {
    return {
      context: pageTextPromise.then((text) => {
        let startPosition = matchIdx - (searchResultContextLength * 0.5)
        startPosition = (startPosition > 0) ? startPosition : 0
        return text.substr(startPosition, searchResultContextLength)
      }),
      matchIdx: idx + currentMatchIdx,
      pageIdx
    }
  })
}

export default Component.extend({
  layout,
  classNames: ['pdf-js'],
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
  _searchResultContextLength: 100,
  _container: undefined,

  // components
  toolbarComponent: 'pdf-js-toolbar',

  // initialization
  didInsertElement () {
    let container = this.element.getElementsByClassName('pdfViewerContainer')[0]
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
    pdfViewer.eventBus.on('pagechange', (evt) => {
      let page = evt.pageNumber
      run(() => {
        this.set('pdfPage', page)
      })
    })

    pdfFindController.onUpdateResultsCount = (total) => {
      run(() => {
        this.set('matchTotal', total)
      })
    }
    pdfFindController.onUpdateState = (state/*, previous, total*/) => {
      run(() => {
        if (state === 3) {
          this.set('isSearchPending', true)
          return
        }
        if (state !== 0 && state !== 2) { // 0 <=> search found something ; 2 <=> wrapped
          return
        }
        this.set('isSearchPending', false)
        let {pageIdx, matchIdx} = pdfFindController.selected
        if (matchIdx !== -1 || pageIdx !== -1) {
          let {pageMatches} = pdfFindController
          let idx = matchIdx + 1
          for (let i = 0; i < pageIdx; i++) {
            idx += pageMatches[i].length
          }
          let match = pdfFindController.pageMatches[pageIdx][matchIdx]
          this.set('currentMatch', match)
          this.set('currentMatchIdx', idx)
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
  // we use an observer to setup this property to provide some sort of caching...
  searchResultsObserver: observer('isSearchPending', 'matchTotal', function () {
    let pdfFindController = this.get('pdfFindController')
    let pdfViewer = this.get('pdfViewer')
    let {pageMatches} = pdfFindController
    if (this.get('isSearchPending')) {
      this.set('searchResultContextsPerPage', A())
      return
    }
    // else
    let searchResultContextsPerPage = this.get('searchResultContextsPerPage')
    let length = searchResultContextsPerPage.get('length')
    if (length >= pageMatches.length) {
      // no new matches yet let's wait
      return
    }
    let searchResultContextLength = this.get('_searchResultContextLength')
    let currentMatchIdx = pageMatches.slice(0, length).reduce((totalMatches, formattedContext) => totalMatches + formattedContext.length, 0)
    console.log('currentLength -> ', length)
    for (let i = length; i < pageMatches.length; i++) {
      if (isEmpty(pageMatches[i])) {
        searchResultContextsPerPage.pushObject([])
      } else {
        searchResultContextsPerPage.pushObject(getResultContextForPage(pdfViewer, i, currentMatchIdx, pageMatches[i], searchResultContextLength))
      }
      currentMatchIdx += pageMatches[i].length
    }
    console.log('searchResultContextsPerPage -> ', searchResultContextsPerPage.length)
    // this.set('searchResultContextsPerPage', searchResultContextsPerPage)
  }),

  // computed
  searchResultContexts: computed('searchResultContextsPerPage.[]', function () {
    let searchResultContextsPerPage = this.get('searchResultContextsPerPage')
    if (isEmpty(searchResultContextsPerPage)) {
      return []
    } // else
    console.log('searchResultContextsPerPage -> ', searchResultContextsPerPage)
    return searchResultContextsPerPage.reduce(
      (joinedContexts, contextsOfPage) => joinedContexts.concat(contextsOfPage),
      []
    )
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
      throw new Error('not implemented yet')
    }
  }
})
