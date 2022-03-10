import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one checkbox', function () {
  setupRenderingTest();

  it('renders one-way-checkbox internally', async function () {
    await render(hbs `{{one-checkbox
      class="this-checkbox"
      isReadOnly=false
      checked=false}}`);

    expect(this.$('input[type=checkbox]'), this.$().html()).to.exist;
  });

  it('renders with base class', async function () {
    await render(hbs `{{one-checkbox
      class="this-checkbox"
      isReadOnly=false
      checked=false}}`);
    expect(this.$('.this-checkbox')).to.exist;
    expect(this.$('.this-checkbox')).to.have.class('one-checkbox');
    expect(this.$('.this-checkbox')).to.have.class('one-checkbox-base');
  });

  it('invokes update action on click', async function (done) {
    let toggleSelectionHandler = sinon.spy();
    this.set('toggleSelection', toggleSelectionHandler);

    await render(hbs `{{one-checkbox
      class="this-checkbox"
      isReadOnly=false
      checked=false
      update=(action toggleSelection)}}`);

    expect(this.$('.this-checkbox')).to.exist;
    click('.this-checkbox').then(() => {
      expect(toggleSelectionHandler).to.be.calledOnce;
      done();
    });
  });
});
