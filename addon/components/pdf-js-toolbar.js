import Ember from 'ember'
import layout from '../templates/components/pdf-js-toolbar'

const { Component } = Ember

export default Component.extend({
  layout,
  actions: {
    nextPage () {
      this.sendAction('nextPage')
    }
  }
})
