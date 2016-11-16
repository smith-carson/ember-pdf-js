/* jshint node: true */
'use strict'
const path = require('path')
const mergeTrees = require('broccoli-merge-trees')
const Funnel = require('broccoli-funnel')

module.exports = {
  name: 'ember-pdf-js',
  included (app) {
    this._super.included(app)

    app.import(`${app.bowerDirectory}/pdfjs-dist/build/pdf.js`)
    // app.import(`${app.bowerDirectory}/pdfjs-dist/build/pdf.combined.js`)
    app.import(`${app.bowerDirectory}/pdfjs-dist/build/pdf.worker.js`)
    app.import(app.bowerDirectory + '/pdfjs-dist/web/pdf_viewer.js')
    app.import(app.bowerDirectory + '/pdfjs-dist/web/pdf_viewer.css')
    // app.import(app.bowerDirectory + '/pdfjs-dist/build/pdf.worker.entry.js')
  },

  treeForPublic (tree) {
    let workerPath = path.join(this.project.root, 'bower_components', 'pdfjs-dist', 'build')
    let pdfJsImages = path.join(this.project.root, 'bower_components', 'pdfjs-dist', 'web', 'images')
    let pdfJsImagesTree = new Funnel(this.treeGenerator(pdfJsImages), {
      destDir: '/assets/images'
    })
    if (tree) {
      return mergeTrees([
        tree,
        workerPath,
        pdfJsImagesTree
      ])
    } else {
      return mergeTrees([
        workerPath,
        pdfJsImagesTree
      ])
    }
  }
}
