import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { createModelFromSpec, ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import OneTooltipHelper from '../../../../../helpers/one-tooltip';
import { drag } from '../../../../../helpers/drag-drop';

describe('Integration | Component | atm-workflow/charts-dashboard-editor/chart-editor/series-groups-list', function () {
  setupRenderingTest();

  it('has working "add series group" button', async function () {
    const executeSpy = sinon.spy();
    this.setProperties({
      chart: createChart(),
      actionsFactory: {
        createAddElementAction: sinon.spy(() => ({ execute: executeSpy })),
      },
    });
    await renderComponent();

    const btn = find('.add-series-group-btn');
    expect(btn).to.contain.text('Add series group');
    expect(executeSpy).to.be.not.called;

    await click(btn);

    expect(this.actionsFactory.createAddElementAction).to.be.calledWith({
      newElementType: ElementType.SeriesGroup,
      targetElement: this.chart,
    });
    expect(executeSpy).to.be.calledOnce;
  });

  it('shows series groups list', async function () {
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
            stacked: true,
            showSum: true,
          },
        },
      }, {
        builderType: 'static',
        builderRecipe: {
          seriesGroupTemplate: {
            id: 'g2',
            name: 'g2',
            subgroups: [{
              id: 'g21',
              name: 'g21',
            }],
          },
        },
      }],
      seriesBuilders: [{
        builderType: 'static',
        builderRecipe: {
          seriesTemplate: {
            id: 's1',
            groupId: 'g1',
          },
        },
      }],
    }));
    await renderComponent();

    const items = findAll('.elements-list-item');

    expect(items).to.have.length(3);
    expect(items[0]).to.contain.text('g1');
    expect(items[0]).to.contain.text('Stack');
    expect(items[0]).to.contain.text('Sum');
    expect(items[0].querySelector('.series-count')).to.have.text('1');
    expect(items[1]).to.contain.text('g2');
    expect(items[1]).to.not.contain.text('Stack');
    expect(items[1]).to.not.contain.text('Sum');
    expect(items[1].querySelector('.series-count')).to.have.text('0');
    expect(items[2]).to.contain.text('g21');
    expect(items[2]).to.not.contain.text('Stack');
    expect(items[2]).to.not.contain.text('Sum');
    expect(items[2].querySelector('.series-count')).to.have.text('0');
    expect(items[1].querySelector('.elements-list-item')).to.equal(items[2]);
  });

  it('shows working actions per item', async function () {
    const addExecuteSpy = sinon.spy();
    const duplicateExecuteSpy = sinon.spy();
    const removeExecuteSpy = sinon.spy();
    this.setProperties({
      chart: createChart({
        seriesGroupBuilders: [emptySeriesGroupSpec('1')],
      }),
      actionsFactory: {
        createAddElementAction: sinon.spy(() => ({ execute: addExecuteSpy })),
        createDuplicateElementAction: sinon.spy(() => ({ execute: duplicateExecuteSpy })),
        createRemoveElementAction: sinon.spy(() => ({ execute: removeExecuteSpy })),
      },
    });
    await renderComponent();

    const actions = findAll('.elements-list-item .action');
    expect(actions).to.have.length(3);
    expect(actions[0]).to.have.class('oneicon-plus');
    expect(await new OneTooltipHelper(actions[0]).getText()).to.equal('Add subgroup');
    expect(actions[1]).to.have.class('oneicon-browser-copy');
    expect(await new OneTooltipHelper(actions[1]).getText()).to.equal('Duplicate');
    expect(actions[2]).to.have.class('oneicon-browser-delete');
    expect(await new OneTooltipHelper(actions[2]).getText()).to.equal('Remove');
    expect(addExecuteSpy).to.be.not.called;
    expect(duplicateExecuteSpy).to.be.not.called;
    expect(removeExecuteSpy).to.be.not.called;

    await click(actions[0]);
    expect(addExecuteSpy).to.be.calledOnce;
    expect(this.actionsFactory.createAddElementAction).to.be.calledWith({
      newElementType: this.chart.seriesGroups[0].elementType,
      targetElement: this.chart.seriesGroups[0],
    });

    await click(actions[1]);
    expect(duplicateExecuteSpy).to.be.calledOnce;
    expect(this.actionsFactory.createDuplicateElementAction).to.be.calledWith({
      elementToDuplicate: this.chart.seriesGroups[0],
    });

    await click(actions[2]);
    expect(removeExecuteSpy).to.be.calledOnce;
    expect(this.actionsFactory.createRemoveElementAction).to.be.calledWith({
      elementToRemove: this.chart.seriesGroups[0],
    });
  });

  it('shows drop zones when root-level element is dragged', async function () {
    this.set('chart', createChart({
      seriesGroupBuilders: [
        emptySeriesGroupSpec('1'),
        emptySeriesGroupSpec('2'),
        emptySeriesGroupSpec('3', [
          emptySeriesGroupSpec('31'),
          emptySeriesGroupSpec('32'),
        ]),
        emptySeriesGroupSpec('4'),
      ],
    }));
    await renderComponent();
    expect(find('.drop-zone-container')).to.not.exist;

    await drag('[data-element-id="2"]');

    const dropZones = findAll('.drop-zone-container');
    [
      ['1', 'inside'],
      ['1', 'before'],
      ['3', 'inside'],
      ['3', 'after'],
      ['31', 'inside'],
      ['31', 'before'],
      ['31', 'after'],
      ['32', 'inside'],
      ['32', 'after'],
      ['4', 'inside'],
      ['4', 'after'],
    ].forEach(([id, placement], idx) => {
      expect(dropZones[idx].dataset['referenceElementId']).to.equal(id);
      expect(dropZones[idx].dataset['placement']).to.equal(placement);
    });
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/charts-dashboard-editor/chart-editor/series-groups-list
    actionsFactory=actionsFactory
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

function emptySeriesGroupSpec(id, subgroups = []) {
  return {
    builderType: 'static',
    builderRecipe: {
      seriesGroupTemplate: {
        id,
        subgroups: subgroups.map((g) => g.builderRecipe.seriesGroupTemplate),
      },
    },
  };
}
