import Ember from 'ember'
import layout from '../templates/components/pdf-js-toolbar'

const {
  Component
} = Ember

export default Component.extend({
  layout,

  // variables
  searchTerms: '',
  caseSensitive: false,
  highlightAll: true,
  phraseSearch: false,
  page: undefined,
  pageTotal: undefined,

  actions: {
    search () {
      let searchTerms = this.get('searchTerms')
      let caseSensitive = this.get('caseSensitive')
      let highlightAll = this.get('highlightAll')
      let phraseSearch = this.get('phraseSearch')

      this.sendAction('search', searchTerms, highlightAll, caseSensitive, phraseSearch)
    },
    updateSearchTerm (newValue) {
      this.set('searchTerms', newValue)
      this.send('search')
    },
    updateCaseSensitive (newValue) {
      this.set('caseSensitive', newValue)
      this.send('search')
    },
    updatePhraseSearch (newValue) {
      this.set('phraseSearch', newValue)
      this.send('search')
    },
    updateHighlightAll (newValue) {
      this.set('highlightAll', newValue)
      this.send('search')
    }
  }
})
