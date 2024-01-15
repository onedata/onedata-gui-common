import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import { createNewSeriesGroup, createNewSeries } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/chart-editor/series-group-editor',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.set('i18n', this.owner.lookup('service:i18n'));
    });

    it('has class "series-group-editor"', async function () {
      await renderComponent();

      expect(find('.series-group-editor')).to.exist;
    });

    it('shows empty list of attached series', async function () {
      this.set('seriesGroup', createSeriesGroup(this));

      await renderComponent();

      expect(find('.series-list .elements-list-item')).to.not.exist;
      expect(find('.empty-details-info')).to.exist.and.to.contain.text(
        'There are no series attached to this group.'
      );
    });

    it('shows list of attached series if there are some', async function () {
      this.set('seriesGroup', createSeriesGroup(this, {
        series: [
          createSeries(this, { name: 's1' }),
          createSeries(this, { name: 's2' }),
        ],
      }));

      await renderComponent();

      const items = findAll('.series-list .elements-list-item');
      expect(items).to.have.length(2);
      expect(items[0]).to.contain.text('s1');
      expect(items[1]).to.contain.text('s2');
      expect(find('.empty-details-info')).to.not.exist;
    });
  }
);

function createSeriesGroup(testCase, props = {}) {
  const seriesGroup = createNewSeriesGroup(testCase.i18n);
  setProperties(seriesGroup, props);
  return seriesGroup;
}

function createSeries(testCase, props = {}) {
  const series = createNewSeries(testCase.i18n);
  setProperties(series, props);
  return series;
}

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/chart-editor/series-group-editor
    chartElement=seriesGroup
  }}`);
}
