import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | two level sidebar/item content', function() {
  setupComponentTest('two-level-sidebar/item-content', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#two-level-sidebar/item-content}}
    //     template content
    //   {{/two-level-sidebar/item-content}}
    // `);

    this.render(hbs`{{two-level-sidebar/item-content}}`);
    expect(this.$()).to.have.length(1);
  });
});
