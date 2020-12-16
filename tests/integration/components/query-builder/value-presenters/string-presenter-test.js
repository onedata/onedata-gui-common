import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | query builder/value presenters/string presenter', function () {
  setupComponentTest('query-builder/value-presenters/string-presenter', {
    integration: true,
  });

  it('renders', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#query-builder/value-presenters/string-presenter}}
    //     template content
    //   {{/query-builder/value-presenters/string-presenter}}
    // `);

    this.render(hbs `{{query-builder/value-presenters/string-presenter}}`);
    expect(this.$()).to.have.length(1);
  });
});
