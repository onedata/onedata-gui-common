import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor/toolbar', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('onRemoveDashboard', sinon.spy());
  });

  it('has class "toolbar"', async function () {
    await renderComponent();

    expect(find('.toolbar')).to.exist;
  });

  it('shows only "remove dashboard" button', async function () {
    await renderComponent();

    const buttons = findAll('button');
    expect(buttons).to.have.length(1);
    expect(buttons[0]).to.have.class('remove-dashboard-btn')
      .and.to.have.class('btn-danger')
      .and.to.contain.text('Remove dashboard')
      .and.to.contain('.oneicon-browser-delete');
  });

  it('shows ack popover on "remove dashboard" button click', async function () {
    await renderComponent();

    await click('.remove-dashboard-btn');

    const popoverContent = find('.webui-popover-content');
    expect(popoverContent.querySelector('p')).to.have.trimmed.text(
      'Are you sure you want to remove this dashboard and all its contents?'
    );
    const cancelBtn = find('.btn-cancel');
    expect(cancelBtn).to.have.class('btn-default');
    expect(cancelBtn).to.have.trimmed.text('No');
    const acceptBtn = find('.btn-confirm');
    expect(acceptBtn).to.have.class('btn-danger');
    expect(acceptBtn).to.have.trimmed.text('Yes');
  });

  it('allows to cancel dashboard removal by cancelling its ack popover', async function () {
    await renderComponent();

    await click('.remove-dashboard-btn');
    await click('.webui-popover-content .btn-cancel');

    expect(this.onRemoveDashboard).to.be.not.called;
  });

  it('removes dashboard by accepting its ack popover', async function () {
    await renderComponent();

    await click('.remove-dashboard-btn');
    await click('.webui-popover-content .btn-confirm');

    expect(this.onRemoveDashboard).to.be.calledOnce;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor/toolbar
    onRemoveDashboard=onRemoveDashboard
  }}`);
}
