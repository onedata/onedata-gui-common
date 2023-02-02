import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import DatasetValueEditorState from 'onedata-gui-common/utils/atm-workflow/value-editors/value-editor-states/dataset';

describe('Integration | Component | atm-workflow/value-editors/dataset/array-item-creator', function () {
  setupRenderingTest();

  beforeEach(function () {
    const itemAtmDataSpec = {
      type: AtmDataSpecType.Dataset,
    };
    const editorContext = {};
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: itemAtmDataSpec,
        },
      }, editorContext),
      editorContext,
      itemAtmDataSpec,
    });
  });

  it('is a link with proper label and "add-item-trigger" class', async function () {
    await renderComponent();

    const link = find('a');
    expect(link).to.exist;
    expect(link).to.have.trimmed.text('Add datasets...');
    expect(link).to.have.class('add-item-trigger');
  });

  it('uses correct parameters during datasets selection after "select datasets" action click',
    async function () {
      const selectDatasets = this.set('editorContext.selectDatasets', sinon.spy());
      await renderComponent();

      await click('.add-item-trigger');
      await click('.select-datasets-action-trigger');

      expect(selectDatasets).to.be.calledOnce
        .and.to.be.calledWith({
          allowMany: true,
          onSelected: sinon.match.func,
          onCancelled: sinon.match.func,
        });
    }
  );

  it('calls "onItemCreated" with newly created items after "select datasets" action click and datasets selection',
    async function () {
      const datasetsToSelect = [{ datasetId: '1' }, { datasetId: '2' }];
      this.set(
        'editorContext.selectDatasets',
        ({ onSelected }) => onSelected(datasetsToSelect)
      );
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();
      expect(onItemsCreated).to.be.not.called;

      await click('.add-item-trigger');
      await click('.select-datasets-action-trigger');

      expect(onItemsCreated).to.be.calledOnce
        .and.to.be.calledWith([
          sinon.match.instanceOf(DatasetValueEditorState),
          sinon.match.instanceOf(DatasetValueEditorState),
        ])
        .and.to.be.calledWith([
          sinon.match.hasNested('value.datasetId', datasetsToSelect[0].datasetId),
          sinon.match.hasNested('value.datasetId', datasetsToSelect[1].datasetId),
        ]);
    }
  );

  it('does not call "onItemCreated" after "select datasets" action click and cancelled datasets selection',
    async function () {
      this.set(
        'editorContext.selectDatasets',
        ({ onCancelled }) => onCancelled()
      );
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();

      await click('.add-item-trigger');
      await click('.select-datasets-action-trigger');

      expect(onItemsCreated).to.be.not.called;
    }
  );

  it('calls "onItemCreated" with newly created item after "provide dataset id" action click and form submission',
    async function () {
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();
      expect(onItemsCreated).to.be.not.called;

      await click('.add-item-trigger');
      await click('.provide-dataset-id-action-trigger');
      await fillIn('.datasetId-field input', 'id1');
      await click('.accept-btn');

      expect(onItemsCreated).to.be.calledOnce
        .and.to.be.calledWith([
          sinon.match.instanceOf(DatasetValueEditorState),
        ])
        .and.to.be.calledWith([
          sinon.match.hasNested('value.datasetId', 'id1'),
        ]);
      // creator came back to it's default look
      expect(find('.add-item-trigger')).to.exist;
    }
  );

  it('comes back to default look from id form when user cancels id providing',
    async function () {
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();

      await click('.add-item-trigger');
      await click('.provide-dataset-id-action-trigger');
      await click('.cancel-btn');

      expect(onItemsCreated).to.be.not.called;
      expect(find('.add-item-trigger')).to.exist;
    }
  );

  it('comes back to default look from id form when user tries to remove id form editor',
    async function () {
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();

      await click('.add-item-trigger');
      await click('.provide-dataset-id-action-trigger');
      await click('.remove-icon');

      expect(onItemsCreated).to.be.not.called;
      expect(find('.add-item-trigger')).to.exist;
    }
  );
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/dataset/array-item-creator
    stateManager=stateManager
    itemAtmDataSpec=itemAtmDataSpec
    onItemsCreated=onItemsCreated
  }}`);
}
