import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/no-dashboard-info', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('onCreateDashboard', sinon.spy());
  });

  it('has class "no-dashboard-info"', async function () {
    await renderComponent();

    expect(find('.no-dashboard-info')).to.exist;
  });

  it('shows info text about no dashboard and button to create one', async function () {
    await renderComponent();

    expect(find('.header')).to.have.trimmed.text(
      'Charts dashboard is not defined yet.'
    );
    expect(find('.description')).to.have.trimmed.text(
      'To create one, click the button below.'
    );
    const btn = find('.create-btn');
    expect(btn).to.have.class('btn-primary')
      .and.to.have.trimmed.text('Create dashboard');
  });

  it('calls "onCreateDashboard" after create button click', async function () {
    await renderComponent();
    expect(this.onCreateDashboard).to.be.not.called;

    await click('.create-btn');

    expect(this.onCreateDashboard).to.be.calledOnce;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/no-dashboard-info
    onCreateDashboard=onCreateDashboard
  }}`);
}
