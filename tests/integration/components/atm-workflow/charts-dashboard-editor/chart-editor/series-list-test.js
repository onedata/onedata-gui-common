import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import {
  createModelFromSpec,
  ElementType,
  EditorContext,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import globals from 'onedata-gui-common/utils/globals';
import OneTooltipHelper from '../../../../../helpers/one-tooltip';
import { drag } from '../../../../../helpers/drag-drop';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/chart-editor/series-list', function () {
  setupRenderingTest();

  it('has working "add series" button', async function () {
    const executeSpy = sinon.spy();
    this.setProperties({
      chart: createChart(),
      editorContext: EditorContext.create({
        actionsFactory: {
          createAddElementAction: sinon.spy(() => ({ execute: executeSpy })),
        },
      }),
    });
    await renderComponent();

    const btn = find('.add-series-btn');
    expect(btn).to.contain.text('Add series');
    expect(executeSpy).to.be.not.called;

    await click(btn);

    expect(this.editorContext.actionsFactory.createAddElementAction).to.be.calledWith({
      newElementType: ElementType.Series,
      targetElement: this.chart,
    });
    expect(executeSpy).to.be.calledOnce;
  });

  it('shows series list', async function () {
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
            yAxisId: 'a1',
            groupId: 'g1',
            name: 's1',
            type: 'bar',
          },
        },
      }, {
        builderType: 'static',
        builderRecipe: {
          seriesTemplate: {
            id: 's2',
            name: 's2',
            type: 'line',
            color: '#ff0000',
          },
        },
      }],
    }));
    await renderComponent();

    const items = findAll('.elements-list-item');

    expect(items).to.have.length(2);
    expect(items[0]).to.contain.text('s1');
    expect(items[0].querySelector('.color-mark')).to.not.exist;
    expect(items[0].querySelector('.series-group-name')).to.contain.text('g1');
    expect(items[0].querySelector('.axis-name')).to.contain.text('a1');
    expect(items[1]).to.contain.text('s2');
    expect(
      globals.window.getComputedStyle(items[1].querySelector('.color-mark'))
      .getPropertyValue('--series-color')
      .trim()
    ).to.equal('#ff0000');
    expect(items[1].querySelector('.series-group-name')).to.not.exist;
    expect(items[1].querySelector('.axis-name')).to.not.exist;
  });

  it('shows working actions per item', async function () {
    const duplicateExecuteSpy = sinon.spy();
    const removeExecuteSpy = sinon.spy();
    this.setProperties({
      chart: createChart({
        seriesBuilders: [emptySeriesSpec('1')],
      }),
      editorContext: EditorContext.create({
        actionsFactory: {
          createDuplicateElementAction: sinon
            .spy(() => ({ execute: duplicateExecuteSpy })),
          createRemoveElementAction: sinon.spy(() => ({ execute: removeExecuteSpy })),
        },
      }),
    });
    await renderComponent();

    const actions = findAll('.elements-list-item .action');
    expect(actions).to.have.length(2);
    expect(actions[0]).to.have.class('oneicon-browser-copy');
    expect(await new OneTooltipHelper(actions[0]).getText()).to.equal('Duplicate');
    expect(actions[1]).to.have.class('oneicon-browser-delete');
    expect(await new OneTooltipHelper(actions[1]).getText()).to.equal('Remove');
    expect(duplicateExecuteSpy).to.be.not.called;
    expect(removeExecuteSpy).to.be.not.called;

    await click(actions[0]);
    expect(duplicateExecuteSpy).to.be.calledOnce;
    expect(this.editorContext.actionsFactory.createDuplicateElementAction)
      .to.be.calledWith({
        elementToDuplicate: this.chart.series[0],
      });

    await click(actions[1]);
    expect(removeExecuteSpy).to.be.calledOnce;
    expect(this.editorContext.actionsFactory.createRemoveElementAction).to.be.calledWith({
      elementToRemove: this.chart.series[0],
    });
  });

  it('shows drop zones when element is dragged', async function () {
    this.set('chart', createChart({
      seriesBuilders: [
        emptySeriesSpec('1'),
        emptySeriesSpec('2'),
        emptySeriesSpec('3'),
        emptySeriesSpec('4'),
      ],
    }));
    await renderComponent();
    expect(find('.drop-zone-container')).to.not.exist;

    await drag('[data-chart-element-id="2"]');

    const dropZones = findAll('.drop-zone-container');
    [
      ['1', 'before'],
      ['3', 'after'],
      ['4', 'after'],
    ].forEach(([id, placement], idx) => {
      expect(dropZones[idx].dataset['referenceElementId']).to.equal(id);
      expect(dropZones[idx].dataset['placement']).to.equal(placement);
    });
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/chart-editor/series-list
    editorContext=editorContext
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

function emptySeriesSpec(id) {
  return {
    builderType: 'static',
    builderRecipe: {
      seriesTemplate: {
        id,
      },
    },
  };
}
