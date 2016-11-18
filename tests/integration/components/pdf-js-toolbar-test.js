import { moduleForComponent, test } from 'ember-qunit'
import hbs from 'htmlbars-inline-precompile'

moduleForComponent('pdf-js-toolbar', 'Integration | Component | pdf js toolbar', {
  integration: true
})

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{pdf-js-toolbar}}`)

  assert.equal(this.$().text().trim(), '')

  // Template block usage:
  this.render(hbs`
    {{#pdf-js-toolbar}}
      template block text
    {{/pdf-js-toolbar}}
  `)

  assert.equal(this.$().text().trim(), 'template block text')
})
