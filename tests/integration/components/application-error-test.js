import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | application error', function () {
  setupComponentTest('application-error', {
    integration: true
  });

  it('renders show details button when error property is provided', function () {
    this.set('model', {
      some: 'error',
    });
    this.render(hbs `{{application-error error=model}}`);
    expect(this.$('.show-error-details')).to.exist;
  });

  it('does not render show details button when error property is not provided',
    function () {
      this.render(hbs `{{application-error}}`);
      expect(this.$('.show-error-details')).to.not.exist;
    });
});
