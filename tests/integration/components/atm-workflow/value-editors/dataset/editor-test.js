import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, findAll, fillIn, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { AtmFileType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';

const exampleDataset = { datasetId: 'd1id' };

describe('Integration | Component | atm-workflow/value-editors/dataset/editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    const editorContext = {
      getDatasetUrlById: async (datasetId) => {
        return `#/${datasetId}`;
      },
      getDatasetDetailsById: async (datasetId) => {
        return {
          datasetId: datasetId,
          rootFileId: `${datasetId}FileId`,
          rootFilePath: `/space1/${datasetId}Name`,
          rootFileType: AtmFileType.Directory,
        };
      },
      selectDatasets: sinon.spy(async (...args) => this.selectDatasets(...args)),
    };
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.Dataset,
      }, editorContext),
      editorContext,
      selectDatasets: ({ onSelected }) => onSelected([exampleDataset]),
    });
  });

  it('has class "dataset-editor"', async function () {
    await renderComponent();

    expect(find('.editor-box')).to.have.class('dataset-editor');
  });

  it('has only "Dataset" text in the header', async function () {
    await renderComponent();

    expect(find('.editor-box-header')).to.have.trimmed.text('Dataset');
    expect(find('.editor-box-toolbar')).to.be.empty;
  });

  it('has working "remove" button when "onRemove" callback is provided', async function () {
    const onRemove = this.set('onRemove', sinon.spy());
    await renderComponent();
    expect(onRemove).to.be.not.called;

    await click('.editor-box-toolbar .remove-icon');

    expect(onRemove).to.be.calledOnce;
  });

  it('shows selector when value is empty', async function () {
    await renderComponent();

    const selectorTrigger = find('.editor-box-content .dataset-value-editor-selector');
    expect(selectorTrigger).to.exist;
    expect(selectorTrigger).to.have.trimmed.text('Select dataset...');
    expect(find('form')).to.not.exist;
  });

  it('allows to select a dataset from selector view', async function () {
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.select-datasets-action-trigger');

    expect(this.editorContext.selectDatasets).to.be.calledOnce
      .and.to.be.calledWith({
        allowMany: false,
        onSelected: sinon.match.func,
        onCancelled: sinon.match.func,
      });
    expect(this.stateManager.value).to.deep.equal(exampleDataset);
    expect(this.stateManager.isValid).to.be.true;
    expect(find('.editor-box-content .dataset-value-editor-selector')).to.not.exist;
    expect(find('.dataset-visual-presenter')).to.exist;
  });

  it('allows to cancel selecting a dataset from selector view', async function () {
    this.set('selectDatasets', ({ onCancelled }) => onCancelled());
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.select-datasets-action-trigger');

    expect(this.stateManager.value).to.deep.equal({ datasetId: '' });
    expect(this.stateManager.isValid).to.be.false;
    expect(find('.editor-box-content .dataset-value-editor-selector')).to.exist;
    expect(find('.dataset-visual-presenter')).to.not.exist;
  });

  it('shows a form when trying to provide dataset ID from selector view', async function () {
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.provide-dataset-id-action-trigger');

    expect(find('.editor-box-content .dataset-value-editor-selector')).to.not.exist;
    expect(find('form')).to.exist;
    const datasetIdField = find('.datasetId-field');
    expect(datasetIdField).to.have.trimmed.text('Dataset ID:');
    expect(datasetIdField).to.contain('input');
    expect(findAll('input')).to.have.length(1);
    const cancelBtn = find('.cancel-btn');
    expect(cancelBtn).to.have.class('btn-default');
    expect(cancelBtn).to.have.trimmed.text('Cancel');
    expect(cancelBtn).to.not.have.attr('disabled');
    const acceptBtn = find('.accept-btn');
    expect(acceptBtn).to.have.class('btn-primary');
    expect(acceptBtn).to.have.trimmed.text('OK');
    expect(acceptBtn).to.have.attr('disabled');
  });

  it('allows to provide dataset ID from selector view', async function () {
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.provide-dataset-id-action-trigger');
    await fillIn('.datasetId-field input', exampleDataset.datasetId);
    await click('.accept-btn');

    expect(this.stateManager.value).to.deep.equal(exampleDataset);
    expect(this.stateManager.isValid).to.be.true;
    expect(find('form')).to.not.exist;
    expect(find('.dataset-visual-presenter')).to.exist;
  });

  it('blocks confirmation button when provided dataset ID is empty', async function () {
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.provide-dataset-id-action-trigger');
    await fillIn('.datasetId-field input', exampleDataset.datasetId);
    await fillIn('.datasetId-field input', '');

    expect(find('.accept-btn')).to.have.attr('disabled');
  });

  it('allows to cancel dataset ID providing and come back to empty view', async function () {
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.provide-dataset-id-action-trigger');
    await click('.cancel-btn');

    expect(this.stateManager.value).to.deep.equal({ datasetId: '' });
    expect(this.stateManager.isValid).to.be.false;
    expect(find('.editor-box-content .dataset-value-editor-selector')).to.exist;
    expect(find('form')).to.not.exist;
  });

  it('shows selected dataset', async function () {
    this.stateManager.value = exampleDataset;

    await renderComponent();

    expect(find('.dataset-visual-presenter')).to.exist;
    expect(find('.details-icon')).to.have.class('main-type-directory');
    expect(find('.dataset-name')).to.have.trimmed.text('d1idName');
    expect(find('.root-file-path-property .property-value')).to.have.trimmed.text(
      (await this.editorContext.getDatasetDetailsById(exampleDataset.datasetId))
      .rootFilePath
    );
  });

  it('shows change action when there is a selected dataset', async function () {
    this.stateManager.value = exampleDataset;

    await renderComponent();

    const changeAction = find('.editor-box-header .dataset-value-editor-selector');
    expect(changeAction).to.exist;
    expect(changeAction).to.have.trimmed.text('Change');
  });

  it('allows to change selected dataset by selecting another one', async function () {
    this.stateManager.value = { datasetId: 'f0Id' };
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.select-datasets-action-trigger');

    expect(this.editorContext.selectDatasets).to.be.calledOnce
      .and.to.be.calledWith({
        allowMany: false,
        onSelected: sinon.match.func,
        onCancelled: sinon.match.func,
      });
    await expectShowingExampleDataset(this);
  });

  it('allows to cancel another dataset selection when dataset is already selected', async function () {
    this.stateManager.value = exampleDataset;
    this.set('selectDatasets', ({ onCancelled }) => onCancelled());
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.select-datasets-action-trigger');

    await expectShowingExampleDataset(this);
  });

  it('allows to change selected dataset by providing ID of another one', async function () {
    this.stateManager.value = { datasetId: 'f0Id' };
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.provide-dataset-id-action-trigger');
    await fillIn('.datasetId-field input', exampleDataset.datasetId);
    await click('.accept-btn');

    await expectShowingExampleDataset(this);
  });

  it('allows to cancel another dataset ID providing when dataset is already selected', async function () {
    this.stateManager.value = exampleDataset;
    await renderComponent();

    await click('.dataset-value-editor-selector');
    await click('.provide-dataset-id-action-trigger');
    await click('.cancel-btn');

    await expectShowingExampleDataset(this);
  });

  it('can be disabled when empty', async function () {
    this.stateManager.isDisabled = true;
    await renderComponent();

    expect(find('.dataset-value-editor-selector')).to.have.class('disabled');
  });

  it('can be disabled when showing a selected dataset', async function () {
    this.stateManager.isDisabled = true;
    this.stateManager.value = exampleDataset;
    await renderComponent();

    expect(find('.dataset-value-editor-selector')).to.not.exist;
  });

  it('can be disabled when providing dataset ID', async function () {
    await renderComponent();
    await click('.dataset-value-editor-selector');
    await click('.provide-dataset-id-action-trigger');

    this.stateManager.isDisabled = true;
    await settled();

    expect(find('button:not([disabled]')).to.not.exist;
    expect(find('input:not([disabled]')).to.not.exist;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/dataset/editor
    stateManager=stateManager
    editorId=stateManager.rootValueEditorStateId
    onRemove=onRemove
  }}`);
}

async function expectShowingExampleDataset(testCase) {
  expect(testCase.stateManager.value).to.deep.equal(exampleDataset);
  expect(testCase.stateManager.isValid).to.be.true;
  expect(find('.dataset-visual-presenter')).to.exist;
  expect(find('.root-file-path-property .property-value')).to.have.trimmed.text(
    (await testCase.editorContext.getDatasetDetailsById(exampleDataset.datasetId))
    .rootFilePath
  );
}
