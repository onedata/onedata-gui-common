import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  createModelFromSpec,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/chart-editor', function () {
  setupRenderingTest();

  it('renders chart elements', async function () {
    this.set('chart', createChart({
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

    expect(find('.chart-editor-elements')).to.contain.text('s1');
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/chart-editor
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
