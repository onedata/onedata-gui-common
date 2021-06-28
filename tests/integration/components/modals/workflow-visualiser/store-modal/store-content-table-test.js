import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | modals/workflow visualiser/store modal/store content table', function() {
  setupComponentTest('modals/workflow-visualiser/store-modal/store-content-table', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#modals/workflow-visualiser/store-modal/store-content-table}}
    //     template content
    //   {{/modals/workflow-visualiser/store-modal/store-content-table}}
    // `);

    this.render(hbs`{{modals/workflow-visualiser/store-modal/store-content-table}}`);
    expect(this.$()).to.have.length(1);
  });
});
