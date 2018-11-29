import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | sidebar clusters/cluster item', function() {
  setupComponentTest('sidebar-clusters/cluster-item', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#sidebar-clusters/cluster-item}}
    //     template content
    //   {{/sidebar-clusters/cluster-item}}
    // `);

    this.render(hbs`{{sidebar-clusters/cluster-item}}`);
    expect(this.$()).to.have.length(1);
  });
});
