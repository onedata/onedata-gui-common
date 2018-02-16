import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one tile', function() {
  setupComponentTest('one-tile', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#one-tile}}
    //     template content
    //   {{/one-tile}}
    // `);

    this.render(hbs`{{one-tile}}`);
    expect(this.$()).to.have.length(1);
  });
});
