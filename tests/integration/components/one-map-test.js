import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one map', function () {
  setupComponentTest('one-map', {
    integration: true
  });

  it('renders', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#one-map}}
    //     template content
    //   {{/one-map}}
    // `);

    this.render(hbs `{{one-map}}`);
    expect(this.$()).to.have.length(1);
  });
});
