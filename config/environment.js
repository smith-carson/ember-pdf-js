/* jshint node:true */
'use strict'

module.exports = function (/* environment, appConfig */) {
  return {
    emberPdfJs: {
      workerSrc: '/pdf.worker.js'
    }
  }
}
