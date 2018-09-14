import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | social box', function() {
  setupComponentTest('social-box', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#social-box}}
    //     template content
    //   {{/social-box}}
    // `);

    this.render(hbs`{{social-box}}`);
    expect(this.$()).to.have.length(1);
  });
});
