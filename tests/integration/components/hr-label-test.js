import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | hr label', function () {
  setupComponentTest('hr-label', {
    integration: true,
  });

  it('renders provided text', function () {
    this.render(hbs `{{#hr-label}}some text{{/hr-label}}`);

    expect(this.$('.hr-label')).to.exist;
    expect(this.$('.hr-label')).to.contain('some text');
  });
});
