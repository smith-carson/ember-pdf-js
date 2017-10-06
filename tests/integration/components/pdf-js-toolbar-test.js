import { moduleForComponent, test } from 'ember-qunit'
import hbs from 'htmlbars-inline-precompile'

moduleForComponent('pdf-js-toolbar', 'Integration | Component | pdf js toolbar', {
  integration: true
})

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('emptyFn', () => {})

  this.render(hbs`{{pdf-js-toolbar changePage=(action emptyFn)}}`)

  // check next/prev buttons exist
  assert.equal(this.$('button').length, 2)
})
