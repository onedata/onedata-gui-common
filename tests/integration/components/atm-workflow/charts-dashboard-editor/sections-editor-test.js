import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('onRemoveDashboard', sinon.spy());
  });

  it('has class "sections-editor"', async function () {
    await renderComponent();

    expect(find('.sections-editor')).to.exist;
  });

  it('propagates actions triggered in toolbar', async function () {
    await renderComponent();
    expect(this.onRemoveDashboard).to.be.not.called;

    await click('.remove-dashboard-btn');
    await click('.webui-popover-content .btn-confirm');

    expect(this.onRemoveDashboard).to.be.calledOnce;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor
    rootSection=rootSection
    onRemoveDashboard=onRemoveDashboard
  }}`);
}
