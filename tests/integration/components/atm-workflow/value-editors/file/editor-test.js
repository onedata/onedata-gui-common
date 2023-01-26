import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, findAll, fillIn, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { AtmFileType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';

const exampleFile = { file_id: 'f1id' };

describe('Integration | Component | atm-workflow/value-editors/file/editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    const editorContext = {
      getFilePathById: async (fileId) => {
        return `/space1/${fileId}`;
      },
      getFileUrlById: async (fileId) => {
        return `#/${fileId}`;
      },
      getFileDetailsById: async (fileId) => {
        return {
          file_id: fileId,
          name: 'dir1',
          type: AtmFileType.Directory,
          size: 1024,
        };
      },
      selectFiles: sinon.spy(async (...args) => this.selectFiles(...args)),
    };
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.File,
        valueConstraints: {
          fileType: AtmFileType.Directory,
        },
      }, editorContext),
      editorContext,
      selectFiles: ({ onSelected }) => onSelected([exampleFile]),
    });
  });

  it('has class "file-editor"', async function () {
    await renderComponent();

    expect(find('.editor-box')).to.have.class('file-editor');
  });

  it('has only "File" text in the header', async function () {
    await renderComponent();

    expect(find('.editor-box-header')).to.have.trimmed.text('File');
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

    const selectorTrigger = find('.editor-box-content .file-value-editor-selector');
    expect(selectorTrigger).to.exist;
    expect(selectorTrigger).to.have.trimmed.text('Select file...');
    expect(find('form')).to.not.exist;
  });

  it('allows to select a file from selector view', async function () {
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.select-upload-files-action-trigger');

    expect(this.editorContext.selectFiles).to.be.calledOnce
      .and.to.be.calledWith({
        atmFileType: AtmFileType.Directory,
        allowMany: false,
        onSelected: sinon.match.func,
        onCancelled: sinon.match.func,
      });
    expect(this.stateManager.value).to.deep.equal(exampleFile);
    expect(this.stateManager.isValid).to.be.true;
    expect(find('.editor-box-content .file-value-editor-selector')).to.not.exist;
    expect(find('.file-visual-presenter')).to.exist;
  });

  it('allows to cancel selecting a file from selector view', async function () {
    this.set('selectFiles', ({ onCancelled }) => onCancelled());
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.select-upload-files-action-trigger');

    expect(this.stateManager.value).to.deep.equal({ file_id: '' });
    expect(this.stateManager.isValid).to.be.false;
    expect(find('.editor-box-content .file-value-editor-selector')).to.exist;
    expect(find('.file-visual-presenter')).to.not.exist;
  });

  it('shows a form when trying to provide file ID from selector view', async function () {
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.provide-file-id-action-trigger');

    expect(find('.editor-box-content .file-value-editor-selector')).to.not.exist;
    expect(find('form')).to.exist;
    const fileIdField = find('.fileId-field');
    expect(fileIdField).to.have.trimmed.text('File ID:');
    expect(fileIdField).to.contain('input');
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

  it('allows to provide file ID from selector view', async function () {
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.provide-file-id-action-trigger');
    await fillIn('.fileId-field input', exampleFile.file_id);
    await click('.accept-btn');

    expect(this.stateManager.value).to.deep.equal(exampleFile);
    expect(this.stateManager.isValid).to.be.true;
    expect(find('form')).to.not.exist;
    expect(find('.file-visual-presenter')).to.exist;
  });

  it('blocks confirmation button when provided file ID is empty', async function () {
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.provide-file-id-action-trigger');
    await fillIn('.fileId-field input', exampleFile.file_id);
    await fillIn('.fileId-field input', '');

    expect(find('.accept-btn')).to.have.attr('disabled');
  });

  it('allows to cancel file ID providing and come back to empty view', async function () {
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.provide-file-id-action-trigger');
    await click('.cancel-btn');

    expect(this.stateManager.value).to.deep.equal({ file_id: '' });
    expect(this.stateManager.isValid).to.be.false;
    expect(find('.editor-box-content .file-value-editor-selector')).to.exist;
    expect(find('form')).to.not.exist;
  });

  it('shows selected file', async function () {
    this.stateManager.value = exampleFile;

    await renderComponent();

    expect(find('.file-visual-presenter')).to.exist;
    expect(find('.details-icon')).to.have.class('effective-type-directory');
    expect(find('.file-name')).to.have.trimmed.text('dir1');
    expect(find('.path-property .property-value')).to.have.trimmed.text(
      await this.editorContext.getFilePathById(exampleFile.file_id)
    );
  });

  it('shows change action when there is a selected file', async function () {
    this.stateManager.value = exampleFile;

    await renderComponent();

    const changeAction = find('.editor-box-header .file-value-editor-selector');
    expect(changeAction).to.exist;
    expect(changeAction).to.have.trimmed.text('Change');
  });

  it('allows to change selected file by selecting another one', async function () {
    this.stateManager.value = { file_id: 'f0Id' };
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.select-upload-files-action-trigger');

    expect(this.editorContext.selectFiles).to.be.calledOnce
      .and.to.be.calledWith({
        atmFileType: AtmFileType.Directory,
        allowMany: false,
        onSelected: sinon.match.func,
        onCancelled: sinon.match.func,
      });
    await expectShowingExampleFile(this);
  });

  it('allows to cancel another file selection when file is already selected', async function () {
    this.stateManager.value = exampleFile;
    this.set('selectFiles', ({ onCancelled }) => onCancelled());
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.select-upload-files-action-trigger');

    await expectShowingExampleFile(this);
  });

  it('allows to change selected file by providing ID of another one', async function () {
    this.stateManager.value = { file_id: 'f0Id' };
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.provide-file-id-action-trigger');
    await fillIn('.fileId-field input', exampleFile.file_id);
    await click('.accept-btn');

    await expectShowingExampleFile(this);
  });

  it('allows to cancel another file ID providing when file is already selected', async function () {
    this.stateManager.value = exampleFile;
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.provide-file-id-action-trigger');
    await click('.cancel-btn');

    await expectShowingExampleFile(this);
  });

  it('can be disabled when empty', async function () {
    this.stateManager.isDisabled = true;
    await renderComponent();

    expect(find('.file-value-editor-selector')).to.have.class('disabled');
  });

  it('can be disabled when showing a selected file', async function () {
    this.stateManager.isDisabled = true;
    this.stateManager.value = exampleFile;
    await renderComponent();

    expect(find('.file-value-editor-selector')).to.not.exist;
  });

  it('can be disabled when providing file ID', async function () {
    await renderComponent();
    await click('.file-value-editor-selector');
    await click('.provide-file-id-action-trigger');

    this.stateManager.isDisabled = true;
    await settled();

    expect(find('button:not([disabled]')).to.not.exist;
    expect(find('input:not([disabled]')).to.not.exist;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/file/editor
    stateManager=stateManager
    editorId=stateManager.rootValueEditorStateId
    onRemove=onRemove
  }}`);
}

async function expectShowingExampleFile(testCase) {
  expect(testCase.stateManager.value).to.deep.equal(exampleFile);
  expect(testCase.stateManager.isValid).to.be.true;
  expect(find('.file-visual-presenter')).to.exist;
  expect(find('.path-property .property-value')).to.have.trimmed.text(
    await testCase.editorContext.getFilePathById(exampleFile.file_id)
  );
}
