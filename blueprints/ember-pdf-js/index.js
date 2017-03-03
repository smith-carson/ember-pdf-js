/* jshint node:true */

module.exports = {
  description: 'default blueprint for ember-pdf-js',

  // locals: function(options) {
  //   // Return custom template variables here.
  //   return {
  //     foo: options.entity.options.foo
  //   };
  // }

  normalizeEntityName () {},

  afterInstall () {
    return this.addBowerPackageToProject('pdfjs-dist', '1.7.316')
  }
}
