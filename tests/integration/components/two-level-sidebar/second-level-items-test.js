import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | two level sidebar/second level items', function() {
  setupComponentTest('two-level-sidebar/second-level-items', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#two-level-sidebar/second-level-items}}
    //     template content
    //   {{/two-level-sidebar/second-level-items}}
    // `);

    this.render(hbs`{{two-level-sidebar/second-level-items}}`);
    expect(this.$()).to.have.length(1);
  });
});
