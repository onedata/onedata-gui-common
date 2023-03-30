import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor/toolbar', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      undoManager: {
        canUndo: false,
        canRedo: false,
        undo: sinon.spy(),
        redo: sinon.spy(),
      },
      onRemoveDashboard: sinon.spy(),
    });
  });

  it('has class "toolbar"', async function () {
    await renderComponent();

    expect(find('.toolbar')).to.exist;
  });

  it('shows "undo", "redo" and "remove dashboard" buttons', async function () {
    await renderComponent();

    const buttons = findAll('button');
    expect(buttons).to.have.length(3);
    expect(buttons[0]).to.have.class('undo-btn')
      .and.to.have.class('btn-default')
      .and.to.contain.text('Undo')
      .and.to.contain('.oneicon-undo');
    expect(buttons[1]).to.have.class('redo-btn')
      .and.to.have.class('btn-default')
      .and.to.contain.text('Redo')
      .and.to.contain('.oneicon-redo');
    expect(buttons[2]).to.have.class('remove-dashboard-btn')
      .and.to.have.class('btn-danger')
      .and.to.contain.text('Remove dashboard')
      .and.to.contain('.oneicon-browser-delete');
  });

  it('has disabled undo and redo buttons when there is no action to undo/redo',
    async function () {
      this.undoManager.canUndo = false;
      this.undoManager.canRedo = false;

      await renderComponent();

      expect(find('.undo-btn')).to.have.attr('disabled');
      expect(find('.redo-btn')).to.have.attr('disabled');
    }
  );

  it('has enabled, working undo button when there is an action to undo',
    async function () {
      this.undoManager.canUndo = true;

      await renderComponent();

      expect(find('.undo-btn')).to.not.have.attr('disabled');
      expect(this.undoManager.undo).to.be.not.called;

      await click('.undo-btn');

      expect(this.undoManager.undo).to.be.calledOnce;
    }
  );

  it('has enabled, working redo button when there is an action to redo',
    async function () {
      this.undoManager.canRedo = true;

      await renderComponent();

      expect(find('.redo-btn')).to.not.have.attr('disabled');
      expect(this.undoManager.redo).to.be.not.called;

      await click('.redo-btn');

      expect(this.undoManager.redo).to.be.calledOnce;
    }
  );

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
    undoManager=undoManager
    onRemoveDashboard=onRemoveDashboard
  }}`);
}
