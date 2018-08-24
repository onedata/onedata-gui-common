import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one tokenfield', function () {
  setupComponentTest('one-tokenfield', {
    integration: true
  });

  it('renders', function () {
    // FIXME: more tests
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#one-tokenfield}}
    //     template content
    //   {{/one-tokenfield}}
    // `);

    this.render(hbs `{{one-tokenfield}}`);
    expect(this.$()).to.exist;
  });
});
