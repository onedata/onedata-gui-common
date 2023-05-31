import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setProperties } from '@ember/object';
import { createNewAxis, createNewSeries } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/chart-editor/axis-editor',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.set('i18n', this.owner.lookup('service:i18n'));
    });

    it('has class "axis-editor"', async function () {
      await renderComponent();

      expect(find('.axis-editor')).to.exist;
    });

    it('has two tabs in details', async function () {
      this.set('axis', createAxis(this, {
        series: [
          createSeries(this, { name: 's1' }),
        ],
      }));

      await renderComponent();

      const navLinks = findAll('.nav-link');
      expect(navLinks).to.have.length(2);
      expect(navLinks[0]).to.contain.text('Attached series');
      expect(navLinks[0].parentElement).to.have.class('active');
      expect(navLinks[1]).to.contain.text('Labels formatting');
      const tabPanes = findAll('.tab-pane');
      expect(tabPanes).to.have.length(2);
      expect(tabPanes[0]).to.have.class('active').and.to.contain('.series-list');
    });

    it('shows empty list of attached series', async function () {
      this.set('axis', createAxis(this));

      await renderComponent();

      expect(find('.series-list .elements-list-item')).to.not.exist;
      expect(find('.empty-details-info')).to.exist.and.to.contain.text(
        'There are no series attached to this axis.'
      );
    });

    it('shows list of attached series if there are some', async function () {
      this.set('axis', createAxis(this, {
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

function createAxis(testCase, props = {}) {
  const axis = createNewAxis(testCase.i18n);
  setProperties(axis, props);
  return axis;
}

function createSeries(testCase, props = {}) {
  const series = createNewSeries(testCase.i18n);
  setProperties(series, props);
  return series;
}

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/chart-editor/axis-editor
    chartElement=axis
  }}`);
}
