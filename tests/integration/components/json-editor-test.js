import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | json editor', function() {
  setupComponentTest('json-editor', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#json-editor}}
    //     template content
    //   {{/json-editor}}
    // `);

    this.render(hbs`{{json-editor}}`);
    expect(this.$()).to.have.length(1);
  });
});
