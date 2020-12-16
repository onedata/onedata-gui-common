import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | query builder/value editors/ base editor', function() {
  setupComponentTest('query-builder/value-editors/-base-editor', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#query-builder/value-editors/-base-editor}}
    //     template content
    //   {{/query-builder/value-editors/-base-editor}}
    // `);

    this.render(hbs`{{query-builder/value-editors/-base-editor}}`);
    expect(this.$()).to.have.length(1);
  });
});
