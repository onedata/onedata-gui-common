import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | application error', function () {
  setupRenderingTest();

  it('renders error details when error property is provided', async function () {
    this.set('model', {
      some: 'some_error',
    });
    await render(hbs `{{application-error error=model}}`);
    expect(find('.error-details')).to.exist;
    expect(find('.error-details').textContent).to.match(/some_error/);
  });
});
