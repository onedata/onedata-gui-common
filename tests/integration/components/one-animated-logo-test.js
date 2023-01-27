import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | one animated logo', function () {
  setupRenderingTest();

  it('expands and collapses', async function () {
    this.set('opened', false);
    await render(hbs `{{one-animated-logo opened=opened}}`);

    expect(find('.one-animated-logo')).not.to.have.class('opened');

    this.set('opened', true);
    await settled();
    expect(find('.one-animated-logo')).to.have.class('opened');

    this.set('opened', false);
    await settled();
    expect(find('.one-animated-logo')).not.to.have.class('opened');
  });
});
