import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import {
  createModelFromSpec,
  ElementType,
  EditorContext,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';
import OneTooltipHelper from '../../../../../helpers/one-tooltip';
import { drag } from '../../../../../helpers/drag-drop';

describe('Integration | Component | atm-workflow/chart-dashboard-editor/chart-editor/axes-list', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(function () {
    this.set('editorContext', EditorContext.create());
  });

  afterEach(function () {
    this.editorContext.destroy();
    this.model?.destroy();
  });

  it('has working "add axis" button', async function () {
    const executeSpy = sinon.spy();
    this.set('editorContext.actionsFactory', {
      createAddElementAction: sinon.spy(() => ({ execute: executeSpy })),
      destroy: () => {},
    });
    this.set('model', createModel());
    await renderComponent();

    const btn = find('.add-axis-btn');
    expect(btn).to.contain.text('Add axis');
    expect(executeSpy).to.be.not.called;

    await click(btn);

    expect(this.editorContext.actionsFactory.createAddElementAction).to.be.calledWith({
      newElementType: ElementType.Axis,
      targetElement: this.model.rootSection.charts[0],
    });
    expect(executeSpy).to.be.calledOnce;
  });

  it('shows axes list', async function () {
    this.set('model', createModel({
      yAxes: [{
        id: '1',
        name: 'a1',
        unitName: 'percent',
      }, {
        id: '2',
        name: 'a2',
        unitName: 'custom',
        unitOptions: {
          customName: 'Liters',
        },
      }],
      seriesBuilders: [{
        builderType: 'static',
        builderRecipe: {
          seriesTemplate: {
            id: 'a',
            yAxisId: '2',
          },
        },
      }],
    }));
    await renderComponent();

    const items = findAll('.elements-list-item');
    expect(items).to.have.length(2);
    expect(items[0]).to.contain.text('a1');
    expect(items[0].querySelector('.unit-name')).to.contain.text('Percent');
    expect(items[0].querySelector('.series-count')).to.contain.text('0');
    expect(items[1]).to.contain.text('a2');
    expect(items[1].querySelector('.unit-name')).to.contain.text('Liters');
    expect(items[1].querySelector('.series-count')).to.contain.text('1');
  });

  it('shows working actions per item', async function () {
    const duplicateExecuteSpy = sinon.spy();
    const removeExecuteSpy = sinon.spy();
    this.set('editorContext.actionsFactory', {
      createDuplicateElementAction: sinon.spy(() => ({ execute: duplicateExecuteSpy })),
      createRemoveElementAction: sinon.spy(() => ({ execute: removeExecuteSpy })),
      destroy: () => {},
    });
    this.set('model', createModel({
      yAxes: [{
        id: '1',
      }],
    }));
    await renderComponent();

    const actions = findAll('.elements-list-item .action');
    expect(actions).to.have.length(2);
    expect(actions[0]).to.have.class('oneicon-browser-copy');
    expect(await new OneTooltipHelper(actions[0]).getText()).to.equal('Duplicate');
    expect(actions[1]).to.have.class('oneicon-browser-delete');
    expect(await new OneTooltipHelper(actions[1]).getText()).to.equal('Remove');
    expect(duplicateExecuteSpy).to.be.not.called;
    expect(removeExecuteSpy).to.be.not.called;

    const axis = this.model.rootSection.charts[0].axes[0];
    await click(actions[0]);
    expect(duplicateExecuteSpy).to.be.calledOnce;
    expect(this.editorContext.actionsFactory.createDuplicateElementAction)
      .to.be.calledWith({
        elementToDuplicate: axis,
      });

    await click(actions[1]);
    expect(removeExecuteSpy).to.be.calledOnce;
    expect(this.editorContext.actionsFactory.createRemoveElementAction).to.be.calledWith({
      elementToRemove: axis,
    });
  });

  it('shows drop zones when element is dragged', async function () {
    this.set('model', createModel({
      yAxes: [{
        id: '1',
      }, {
        id: '2',
      }, {
        id: '3',
      }, {
        id: '4',
      }],
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
  await render(hbs`{{atm-workflow/chart-dashboard-editor/chart-editor/axes-list
    editorContext=editorContext
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
