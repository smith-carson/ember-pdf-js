import Ember from 'ember'
import layout from '../templates/components/pdf-js-toolbar'

const { Component } = Ember

export default Component.extend({
  layout,

  // variables
  searchTerm: '',
  caseSensitive: false,
  highlightAll: true,
  phraseSearch: false,

  actions: {
    search () {
      let searchTerm = this.get('searchTerm')
      let caseSensitive = this.get('caseSensitive')
      let highlightAll = this.get('highlightAll')
      let phraseSearch = this.get('phraseSearch')

      this.sendAction('search', searchTerm, highlightAll, caseSensitive, phraseSearch)
    },
    updateSearchTerm () {
      Ember.Logger.debug('updateSearchTerm', arguments)
    }
  }
})
