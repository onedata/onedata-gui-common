import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | query params hash', function() {
  setupComponentTest('query-params-hash', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#query-params-hash}}
    //     template content
    //   {{/query-params-hash}}
    // `);
    this.set('inputValue', '1234');

    this.render(hbs`{{query-params-hash inputValue}}`);

    expect(this.$().text().trim()).to.equal('1234');
  });
});

