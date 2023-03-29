import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | atm-workflow/charts-dashboard-editor', function () {
  setupRenderingTest();

  it('has class "charts-dashboard-editor"', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(find('.charts-dashboard-editor')).to.exist;
  });

  it('shows "no dashboard" info when dashboard spec is not provided', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(helper.noDashboardInfo).to.exist;
  });

  it('does not show "no dashboard" info when dashboard spec is provided', async function () {
    const helper = new Helper(this, { rootSection: {} });

    await helper.render();

    expect(helper.noDashboardInfo).to.not.exist;
  });

  it('does not show "no dashboard" info when dashboard spec was not provided and user created one',
    async function () {
      const helper = new Helper(this);
      await helper.render();

      await click(helper.createDashboardBtn);

      expect(helper.noDashboardInfo).to.not.exist;
    }
  );

  it('shows "no dashboard" info when user created dashboard and then another nullish dashboard spec was provided',
    async function () {
      const helper = new Helper(this);
      await helper.render();

      await click(helper.createDashboardBtn);
      helper.dashboardSpec = {};
      await settled();

      expect(helper.noDashboardInfo).to.exist;
    }
  );
});

class Helper {
  get noDashboardInfo() {
    return find('.no-dashboard-info');
  }

  get createDashboardBtn() {
    return this.noDashboardInfo?.querySelector('.create-btn');
  }

  get dashboardSpec() {
    return this.testContext.get('dashboardSpec');
  }

  set dashboardSpec(value) {
    this.testContext.set('dashboardSpec', value);
  }

  constructor(testContext, dashboardSpec = {}) {
    this.testContext = testContext;
    this.dashboardSpec = dashboardSpec;
  }

  async render() {
    await render(hbs`{{atm-workflow/charts-dashboard-editor
      dashboardSpec=dashboardSpec
    }}`);
  }
}
