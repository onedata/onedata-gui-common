import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one animated logo', function () {
  setupRenderingTest();

  it('expands and collapses', async function () {
    this.set('opened', false);
    await render(hbs `{{one-animated-logo opened=opened}}`);

    expect(this.$('.one-animated-logo')).not.to.have.class('opened');

    this.set('opened', true);
    await settled();
    expect(this.$('.one-animated-logo')).to.have.class('opened');

    this.set('opened', false);
    await settled();
    expect(this.$('.one-animated-logo')).not.to.have.class('opened');
  });
});
