import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  createModelFromSpec,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';

describe('Integration | Component | atm-workflow/chart-dashboard-editor/chart-editor', function () {
  const { afterEach } = setupRenderingTest();

  afterEach(function () {
    this.model?.destroy();
  });

  it('renders chart elements', async function () {
    this.set('model', createModel({
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
  await render(hbs`{{atm-workflow/chart-dashboard-editor/chart-editor
    chart=model.rootSection.charts.[0]
  }}`);
}

function createModel(chartSpec = {}) {
  return createModelFromSpec({
    rootSection: {
      charts: [chartSpec],
    },
  });
}
