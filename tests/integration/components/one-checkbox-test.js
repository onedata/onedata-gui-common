import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import sinon from 'sinon';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | one-checkbox', function () {
  setupRenderingTest();

  it('renders one-way-checkbox internally', async function () {
    await render(hbs `{{one-checkbox
      class="this-checkbox"
      isReadOnly=false
      checked=false}}`);

    expect(find('input[type=checkbox]'), this.element.innerHTML).to.exist;
  });

  it('renders with base class', async function () {
    await render(hbs `{{one-checkbox
      class="this-checkbox"
      isReadOnly=false
      checked=false}}`);
    expect(find('.this-checkbox')).to.exist;
    expect(find('.this-checkbox')).to.have.class('one-checkbox');
    expect(find('.this-checkbox')).to.have.class('one-checkbox-base');
  });

  it('invokes update action on click', async function () {
    const toggleSelectionHandler = sinon.spy();
    this.set('toggleSelection', toggleSelectionHandler);

    await render(hbs `{{one-checkbox
      class="this-checkbox"
      isReadOnly=false
      checked=false
      update=(action toggleSelection)}}`);

    expect(find('.this-checkbox')).to.exist;
    await click('.this-checkbox');
    expect(toggleSelectionHandler).to.be.calledOnce;
  });
});
