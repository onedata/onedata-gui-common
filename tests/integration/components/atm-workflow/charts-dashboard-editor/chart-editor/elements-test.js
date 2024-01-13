import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { createModelFromSpec } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/chart-editor/elements', function () {
  setupRenderingTest();

  it('has three tabs with chart elements inside', async function () {
    this.set('chart', createChart({
      yAxes: [{
        id: 'a1',
        name: 'a1',
      }],
      seriesGroupBuilders: [{
        builderType: 'static',
        builderRecipe: {
          seriesGroupTemplate: {
            id: 'g1',
            name: 'g1',
          },
        },
      }],
      seriesBuilders: [{
        builderType: 'static',
        builderRecipe: {
          seriesTemplate: {
            id: 's1',
            name: 's1',
          },
        },
      }],
    }));
    await renderComponent();

    expect(find('h2')).to.contain.text('Chart elements');
    const tabs = findAll('.nav-link');
    expect(tabs).to.have.length(3);
    expect(tabs[0]).to.contain.text('Series');
    expect(tabs[0]).to.contain('.oneicon-chart');
    expect(tabs[1]).to.contain.text('Series groups');
    expect(tabs[1]).to.contain('.oneicon-items-grid');
    expect(tabs[2]).to.contain.text('Axes');
    expect(tabs[2]).to.contain('.oneicon-axes');

    await click(tabs[0]);

    expect(find('.series-list')).to.contain.text('s1');

    await click(tabs[1]);

    expect(find('.series-groups-list')).to.contain.text('g1');

    await click(tabs[2]);

    expect(find('.axes-list')).to.contain.text('a1');
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/chart-editor/elements
    chart=chart
  }}`);
}

function createChart(chartSpec = {}) {
  return createModelFromSpec({
    rootSection: {
      charts: [chartSpec],
    },
  }).rootSection.charts[0];
}
