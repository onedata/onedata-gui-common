import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | application error', function () {
  setupRenderingTest();

  it('renders error details when error property is provided', async function () {
    this.set('model', {
      some: 'some_error',
    });
    await render(hbs `{{application-error error=model}}`);
    expect(this.$('.error-details')).to.exist;
    expect(this.$('.error-details').text()).to.match(/some_error/);
  });
});
