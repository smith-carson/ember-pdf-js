# Ember-pdf-js

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Latest NPM release](https://img.shields.io/npm/v/ember-pdf-js.svg)](https://www.npmjs.com/package/ember-pdf-js)
[![Ember Observer Score](http://emberobserver.com/badges/ember-pdf-js.svg)](http://emberobserver.com/addons/ember-pdf-js)
[![License](https://img.shields.io/npm/l/ember-pdf-js.svg)](LICENSE.md)
[![Dependencies](https://img.shields.io/david/smith-carson/ember-pdf-js.svg)](https://david-dm.org/smith-carson/ember-pdf-js)
[![Dev Dependencies](https://img.shields.io/david/dev/smith-carson/ember-pdf-js.svg)](https://david-dm.org/smith-carson/ember-pdf-js#info=devDependencies)


This is a simple addon to wrap PDF.js in ember.

## Addon's "API"

To use it in a really simple way just use the `pdf-js` component:

```handlebars
{{pdf-js pdf=urlOfYourPdf}}
```

In most cases, you will want to "extend" the toolbar component, you can develop your own component and make `ember-pdf-js` use it:

```handlebars
{{pdf-js pdf=urlOfYourPdf toolbarComponent="your-component-here"}}
```

Your toolbar component should extends the original component:

```javascript
import PdfJsToolbar from 'ember-pdf-js/components/pdf-js-toolbar';
import layout from '../../templates/components/pdf-js/toolbar';

export default PdfJsToolbar.extend({
  layout
  })
```


## A word about the current page update

There are some limitation ATM on how the current page is updated. The "scroll" need to be placed on the `.pdfViewerContainer`. For an example on how to do it, check the dummy app's [style sheet](https://github.com/smith-carson/ember-pdf-js/blob/master/tests/dummy/app/styles/app.css)
