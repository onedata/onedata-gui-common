import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { AtmFileType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import FileValueEditorState from 'onedata-gui-common/utils/atm-workflow/value-editors/value-editor-states/file';

describe('Integration | Component | atm-workflow/value-editors/file/array-item-creator', function () {
  setupRenderingTest();

  beforeEach(function () {
    const itemAtmDataSpec = {
      type: AtmDataSpecType.File,
      fileType: AtmFileType.Directory,
    };
    const editorContext = {};
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.Array,
        itemDataSpec: itemAtmDataSpec,
      }, editorContext),
      editorContext,
      itemAtmDataSpec,
    });
  });

  it('is a link with proper label and "add-item-trigger" class', async function () {
    await renderComponent();

    const link = find('a');
    expect(link).to.exist;
    expect(link).to.have.trimmed.text('Add files...');
    expect(link).to.have.class('add-item-trigger');
  });

  it('uses correct parameters during files selection after "select files" action click',
    async function () {
      const selectFiles = this.set('editorContext.selectFiles', sinon.spy());
      await renderComponent();

      await click('.add-item-trigger');
      await click('.select-upload-files-action-trigger');

      expect(selectFiles).to.be.calledOnce
        .and.to.be.calledWith({
          atmFileType: AtmFileType.Directory,
          allowMany: true,
          onSelected: sinon.match.func,
          onCancelled: sinon.match.func,
        });
    }
  );

  it('calls "onItemCreated" with newly created items after "select files" action click and files selection',
    async function () {
      const filesToSelect = [{ file_id: '1' }, { file_id: '2' }];
      this.set(
        'editorContext.selectFiles',
        ({ onSelected }) => onSelected(filesToSelect)
      );
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();
      expect(onItemsCreated).to.be.not.called;

      await click('.add-item-trigger');
      await click('.select-upload-files-action-trigger');

      expect(onItemsCreated).to.be.calledOnce
        .and.to.be.calledWith([
          sinon.match.instanceOf(FileValueEditorState),
          sinon.match.instanceOf(FileValueEditorState),
        ])
        .and.to.be.calledWith([
          sinon.match.hasNested('value.file_id', filesToSelect[0].file_id),
          sinon.match.hasNested('value.file_id', filesToSelect[1].file_id),
        ]);
    }
  );

  it('does not call "onItemCreated" after "select files" action click and cancelled files selection',
    async function () {
      this.set(
        'editorContext.selectFiles',
        ({ onCancelled }) => onCancelled()
      );
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();

      await click('.add-item-trigger');
      await click('.select-upload-files-action-trigger');

      expect(onItemsCreated).to.be.not.called;
    }
  );

  it('calls "onItemCreated" with newly created item after "provide file id" action click and form submission',
    async function () {
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();
      expect(onItemsCreated).to.be.not.called;

      await click('.add-item-trigger');
      await click('.provide-file-id-action-trigger');
      await fillIn('.fileId-field input', 'id1');
      await click('.accept-btn');

      expect(onItemsCreated).to.be.calledOnce
        .and.to.be.calledWith([
          sinon.match.instanceOf(FileValueEditorState),
        ])
        .and.to.be.calledWith([
          sinon.match.hasNested('value.file_id', 'id1'),
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
      await click('.provide-file-id-action-trigger');
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
      await click('.provide-file-id-action-trigger');
      await click('.remove-icon');

      expect(onItemsCreated).to.be.not.called;
      expect(find('.add-item-trigger')).to.exist;
    }
  );
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/file/array-item-creator
    stateManager=stateManager
    itemAtmDataSpec=itemAtmDataSpec
    onItemsCreated=onItemsCreated
  }}`);
}
