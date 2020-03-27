import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | application error', function () {
  setupComponentTest('application-error', {
    integration: true,
  });

  it('renders error details when error property is provided', function () {
    this.set('model', {
      some: 'some_error',
    });
    this.render(hbs `{{application-error error=model}}`);
    expect(this.$('.error-details')).to.exist;
    expect(this.$('.error-details').text()).to.match(/some_error/);
  });
});
