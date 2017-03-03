/* global PDFJS */
import Ember from 'ember'

const { getOwner, Service } = Ember

export default Service.extend({
  init () {
    this._super(...arguments)

    let appConfig = getOwner(this).resolveRegistration('config:environment')
    let addonConfig = appConfig.emberPdfJs

    this.PDFJS = PDFJS
    this.PDFJS.workerSrc = addonConfig.workerSrc
  }
})
