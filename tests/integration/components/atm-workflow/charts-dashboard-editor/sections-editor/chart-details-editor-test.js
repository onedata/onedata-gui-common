import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import { createNewChart } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/sections-editor/chart-details-editor',
  function () {
    setupRenderingTest();

    it('has class "chart-details-editor"', async function () {
      await renderComponent();

      expect(find('.chart-details-editor')).to.exist;
    });

    it('has two fields - title and title tip', async function () {
      await renderComponent();

      const fields = findAll('.field-renderer:not(.form-fields-group-renderer)');
      expect(fields).to.have.length(2);

      expect(fields[0].querySelector('.control-label')).to.contain.text('Title');
      expect(fields[0].querySelector('input[type="text"]')).to.exist
        .and.to.have.attr('placeholder', 'No title');

      expect(fields[1].querySelector('.control-label')).to.contain.text('Title tip');
      expect(fields[1].querySelector('textarea')).to.exist
        .and.to.have.attr('placeholder', 'No title tip');
    });

    it('shows chart data in fields', async function () {
      this.set('chart', createChart(this, {
        title: 'title',
        titleTip: 'tip',
      }));

      await renderComponent();

      expect(find('.title-field .form-control')).to.have.value('title');
      expect(find('.titleTip-field .form-control')).to.have.value('tip');
    });

    it('updates field values when chart data changes', async function () {
      this.set('chart', createChart(this, {
        title: 'title',
        titleTip: 'tip',
      }));
      await renderComponent();

      this.set('chart.title', 'title2');
      await settled();

      expect(find('.title-field .form-control')).to.have.value('title2');

      this.set('chart.titleTip', 'tip2');
      await settled();

      expect(find('.titleTip-field .form-control')).to.have.value('tip2');
    });
  }
);

function createChart(testCase, props = {}) {
  const chart = createNewChart(testCase.owner.lookup('service:i18n'));
  setProperties(chart, props);
  return chart;
}

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/sections-editor/chart-details-editor
    chart=chart
  }}`);
}
