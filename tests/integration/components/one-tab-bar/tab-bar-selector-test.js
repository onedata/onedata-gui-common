import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one tab bar/tab bar selector', function() {
  setupComponentTest('one-tab-bar/tab-bar-selector', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#one-tab-bar/tab-bar-selector}}
    //     template content
    //   {{/one-tab-bar/tab-bar-selector}}
    // `);

    this.render(hbs`{{one-tab-bar/tab-bar-selector}}`);
    expect(this.$()).to.have.length(1);
  });
});
