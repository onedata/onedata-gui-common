import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | sidebar clusters', function() {
  setupComponentTest('sidebar-clusters', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#sidebar-clusters}}
    //     template content
    //   {{/sidebar-clusters}}
    // `);

    this.render(hbs`{{sidebar-clusters}}`);
    expect(this.$()).to.have.length(1);
  });
});
