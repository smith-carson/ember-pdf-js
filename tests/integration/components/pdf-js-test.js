import { moduleForComponent, test } from 'ember-qunit'
import hbs from 'htmlbars-inline-precompile'

moduleForComponent('pdf-js', 'Integration | Component | pdf js', {
  integration: true
})

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{pdf-js}}`)

  // check toolbar included
  assert.equal(this.$('.toolbar').length, 1)
  // check next/prev buttons exist
  assert.equal(this.$('.toolbar button').length, 2)
})
