import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | revisions table/entries section', function() {
  setupComponentTest('revisions-table/entries-section', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#revisions-table/entries-section}}
    //     template content
    //   {{/revisions-table/entries-section}}
    // `);

    this.render(hbs`{{revisions-table/entries-section}}`);
    expect(this.$()).to.have.length(1);
  });
});
