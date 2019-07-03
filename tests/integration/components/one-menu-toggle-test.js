import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one menu toggle', function() {
  setupComponentTest('one-menu-toggle', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#one-menu-toggle}}
    //     template content
    //   {{/one-menu-toggle}}
    // `);

    this.render(hbs`{{one-menu-toggle}}`);
    expect(this.$()).to.have.length(1);
  });
});
