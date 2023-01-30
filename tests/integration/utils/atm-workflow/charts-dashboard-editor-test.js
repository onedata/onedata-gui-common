import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { find, fillIn, render } from '@ember/test-helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import {
  default as ChartsDashboardEditor,
  formValueToChartsDashboardSpec,
  chartsDashboardSpecToFormValue,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import { set } from '@ember/object';

describe('Integration | Utility | atm workflow/charts dashboard editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    const rootGroup = this.set('rootGroup', FormFieldsRootGroup.create({
      ownerSource: this.owner,
      fields: [
        ChartsDashboardEditor.create({
          name: 'dashboardSpec',
        }),
      ],
    }));
    rootGroup.reset();
  });

  context('in edit mode', function () {
    it('has "null" default value', async function () {
      await renderForm();

      expect(getJsValue(this)).to.be.null;
      expect(getRenderedValue()).to.equal('null');
    });

    it('shows passed dashboard spec', async function () {
      const dashboardSpec = {
        rootSection: {
          charts: [],
        },
      };
      const stringifiedDashboardSpec = JSON.stringify(dashboardSpec, null, 2);
      set(
        this.rootGroup.valuesSource,
        'dashboardSpec',
        chartsDashboardSpecToFormValue(dashboardSpec)
      );

      await renderForm();

      expect(getJsValue(this)).to.deep.equal(dashboardSpec);
      expect(getRenderedValue()).to.equal(stringifiedDashboardSpec);
    });

    it('allows to input new dashboard spec', async function () {
      const dashboardSpec = {
        rootSection: {
          charts: [],
        },
      };
      const stringifiedDashboardSpec = JSON.stringify(dashboardSpec, null, 2);
      await renderForm();

      await fillIn('textarea', stringifiedDashboardSpec);

      expect(getJsValue(this)).to.deep.equal(dashboardSpec);
      expect(getRenderedValue()).to.equal(stringifiedDashboardSpec);
    });
  });

  context('in view mode', function () {
    beforeEach(function () {
      this.get('rootGroup').changeMode('view');
    });

    it('shows passed dashboard spec in readonly mode', async function () {
      const dashboardSpec = {
        rootSection: {
          charts: [],
        },
      };
      const stringifiedDashboardSpec = JSON.stringify(dashboardSpec, null, 2);
      set(
        this.rootGroup.valuesSource,
        'dashboardSpec',
        chartsDashboardSpecToFormValue(dashboardSpec)
      );

      await renderForm();

      expect(getJsValue(this)).to.deep.equal(dashboardSpec);
      expect(getRenderedValue()).to.equal(stringifiedDashboardSpec);
      expect(find('textarea')).to.have.attr('readonly');
    });
  });
});

async function renderForm() {
  await render(hbs `{{form-component/field-renderer field=rootGroup}}`);
}

function getRenderedValue() {
  return find('textarea').value;
}

function getJsValue(testCase) {
  return formValueToChartsDashboardSpec(testCase.rootGroup.dumpValue().dashboardSpec);
}
