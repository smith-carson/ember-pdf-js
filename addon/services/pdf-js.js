/* global PDFJS */
import Ember from 'ember'
// import PDFJS from 'npm:pdfjs-dist'

const { getOwner, Service } = Ember

export default Service.extend({
  pdfLib: undefined,
  init () {
    this._super(...arguments)

    let appConfig = getOwner(this).resolveRegistration('config:environment')
    let addonConfig = appConfig.emberPdfJs

    this.PDFJS = PDFJS
    this.PDFJS.workerSrc = addonConfig.workerSrc
  }
})
