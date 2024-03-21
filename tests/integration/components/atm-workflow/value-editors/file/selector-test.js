import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { AtmFileType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types/file';

describe('Integration | Component | atm-workflow/value-editors/file/selector', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      atmDataSpec: {
        type: AtmDataSpecType.File,
        fileType: AtmFileType.Any,
      },
      editorContext: {
        selectFiles: sinon.spy(),
      },
      allowManyFiles: false,
      triggerText: 'trigger text',
    });
  });

  it('renders selector trigger in a form of a link with class "file-value-editor-selector"',
    async function () {
      await renderComponent();

      const trigger = find('a');
      expect(trigger).to.have.class('file-value-editor-selector');
      expect(trigger).to.have.trimmed.text(this.triggerText);
    }
  );

  it('shows "select files" and "enter file id" actions in popover after trigger click',
    async function () {
      await renderComponent();

      await click('.file-value-editor-selector');

      const actions = findAll('.file-value-editor-selector-actions a');
      expect(actions).to.have.length(2);
      expect(actions[0]).to.have.trimmed.text('Select/upload file');
      expect(actions[0]).to.have.class('select-upload-files-action-trigger');
      expect(actions[0].parentElement).to.not.have.class('disabled');
      expect(actions[1]).to.have.trimmed.text('Enter file ID');
      expect(actions[1]).to.have.class('provide-file-id-action-trigger');
      expect(actions[1].parentElement).to.not.have.class('disabled');
    }
  );

  it('uses different label for "select files" action when "allowManyFiles" is true',
    async function () {
      this.set('allowManyFiles', true);
      await renderComponent();

      await click('.file-value-editor-selector');

      expect(find('.select-upload-files-action-trigger'))
        .to.have.trimmed.text('Select/upload files');
    }
  );

  it('calls "onIdProvidingStarted" when "enter file id" action has been clicked',
    async function () {
      const actionSpy = this.set('onIdProvidingStarted', sinon.spy());
      await renderComponent();

      await click('.file-value-editor-selector');
      expect(actionSpy).to.be.not.called;
      await click('.provide-file-id-action-trigger');

      expect(actionSpy).to.be.calledOnce;
    }
  );

  it('calls "editorContext.selectFiles" when "select files" action has been clicked',
    async function () {
      await renderComponent();

      await click('.file-value-editor-selector');
      expect(this.editorContext.selectFiles).to.be.not.called;
      await click('.select-upload-files-action-trigger');

      expect(this.editorContext.selectFiles).to.be.calledOnce
        .and.to.be.calledWith({
          atmFileType: AtmFileType.Any,
          allowMany: false,
          onSelected: sinon.match.func,
          onCancelled: sinon.match.func,
        });
    }
  );

  it('calls "onFilesSelected" when "select files" action has been clicked and files have been selected',
    async function () {
      const filesToSelect = [{ fileId: '1' }];
      let onSelectedCallback;
      this.set(
        'editorContext.selectFiles',
        ({ onSelected }) => onSelectedCallback = onSelected
      );
      const onFilesSelected = this.set('onFilesSelected', sinon.spy());
      await renderComponent();

      await click('.file-value-editor-selector');
      await click('.select-upload-files-action-trigger');
      expect(onFilesSelected).to.be.not.called;
      onSelectedCallback(filesToSelect);
      await settled();

      expect(onFilesSelected).to.be.calledOnce.and.to.be.calledWith(filesToSelect);
    }
  );

  it('does not call "onFilesSelected" when "select files" action has been clicked and files selection has been cancelled',
    async function () {
      this.set('editorContext.selectFiles', ({ onCancelled }) => onCancelled());
      const onFilesSelected = this.set('onFilesSelected', sinon.spy());
      await renderComponent();

      await click('.file-value-editor-selector');
      await click('.select-upload-files-action-trigger');
      await settled();

      expect(onFilesSelected).to.be.not.called;
    }
  );

  it('passes custom parameters to files selector', async function () {
    this.set('atmDataSpec.fileType', AtmFileType.Directory);
    this.set('allowManyFiles', true);
    await renderComponent();

    await click('.file-value-editor-selector');
    await click('.select-upload-files-action-trigger');

    expect(this.editorContext.selectFiles).to.be.calledOnce
      .and.to.be.calledWith({
        atmFileType: AtmFileType.Directory,
        allowMany: true,
        onSelected: sinon.match.func,
        onCancelled: sinon.match.func,
      });
  });

  it('has disabled "select files" action when "editorContext.selectFiles" is not provided',
    async function () {
      this.set('editorContext.selectFiles', undefined);
      await renderComponent();

      await click('.file-value-editor-selector');

      expect(find('.select-upload-files-action-trigger').parentElement)
        .to.have.class('disabled');
    }
  );
});

async function renderComponent() {
  await render(hbs`{{#atm-workflow/value-editors/file/selector
    atmDataSpec=atmDataSpec
    editorContext=editorContext
    onFilesSelected=onFilesSelected
    onIdProvidingStarted=onIdProvidingStarted
    allowManyFiles=allowManyFiles
  }}
    {{triggerText}}
  {{/atm-workflow/value-editors/file/selector}}`);
}
