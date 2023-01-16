import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import { Promise, reject } from 'rsvp';
import { FileType } from 'onedata-gui-common/utils/file';

describe('Integration | Component | atm workflow/value presenters/file/visual presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      context: {
        getSymbolicLinkTargetById: async (id) => this.get('symbolicLinkTarget')(id),
        getFilePathById: async (id) => this.get('filePath')(id),
        getFileUrlById: async (id) => this.get('fileUrl')(id),
      },
      symbolicLinkTarget: (id) => ({
        file_id: `target-${id}`,
        type: FileType.Directory,
        size: 512,
      }),
      filePath: (id) => `/a/b/c-${id}`,
      fileUrl: (id) => `/some/url-${id}`,
    });
  });

  it('has classes "visual-presenter" and "file-visual-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/file/visual-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('visual-presenter')
      .and.to.have.class('file-visual-presenter');
  });

  it('shows complete information about a regular file', async function () {
    const file = this.set('file', {
      file_id: 'some_id',
      name: 'file1',
      type: FileType.Regular,
      size: 1024,
    });
    await render(hbs`{{atm-workflow/value-presenters/file/visual-presenter
      context=context
      value=file
    }}`);

    expect(find('.one-file-icon')).to.have.class('main-type-regular');
    expect(find('.file-name')).to.have.trimmed.text(file.name)
      .and.to.match('a')
      .and.to.have.attr('href', this.get('fileUrl')(this.get('file.file_id')));
    expect(find('.path-property .property-value'))
      .to.have.trimmed.text(this.get('filePath')(this.get('file.file_id')));
    expect(find('.size-property .property-value'))
      .to.have.trimmed.text('1 KiB');
  });

  it('handles case when all file properties are missing', async function () {
    this.set('file', null);
    await render(hbs`{{atm-workflow/value-presenters/file/visual-presenter
      context=context
      value=file
    }}`);

    expect(find('.one-file-icon')).to.have.class('main-type-regular');
    expect(find('.file-name')).to.have.trimmed.text('Unknown')
      .and.to.match('span')
      .and.to.not.have.attr('href');
    expect(find('.path-property .property-value'))
      .to.have.trimmed.text('Unknown');
    expect(find('.size-property .property-value'))
      .to.have.trimmed.text('Unknown');
  });

  it('handles case when all file properties are missing except ID', async function () {
    this.set('file', {
      file_id: 'some_id',
    });
    await render(hbs`{{atm-workflow/value-presenters/file/visual-presenter
      context=context
      value=file
    }}`);

    expect(find('.one-file-icon')).to.have.class('main-type-regular');
    expect(find('.file-name')).to.have.trimmed.text('Unknown')
      .and.to.match('a')
      .and.to.have.attr('href', this.get('fileUrl')(this.get('file.file_id')));
    expect(find('.path-property .property-value'))
      .to.have.trimmed.text(this.get('filePath')(this.get('file.file_id')));
    expect(find('.size-property .property-value'))
      .to.have.trimmed.text('Unknown');
  });

  it('shows complete information about a symbolic link file', async function () {
    const file = this.set('file', {
      file_id: 'some_id',
      name: 'file1',
      type: FileType.SymbolicLink,
      size: 1024,
    });
    await render(hbs`{{atm-workflow/value-presenters/file/visual-presenter
      context=context
      value=file
    }}`);

    expect(find('.one-file-icon')).to.have.class('main-type-symbolic-link')
      .and.to.have.class('effective-type-directory');
    expect(find('.file-name')).to.have.trimmed.text(file.name)
      .and.to.match('a')
      .and.to.have.attr('href', this.get('fileUrl')(this.get('file.file_id')));
    expect(find('.path-property .property-value'))
      .to.have.trimmed.text(this.get('filePath')(this.get('file.file_id')));
    expect(find('.size-property .property-value'))
      .to.have.trimmed.text('512 B');
  });

  it('shows available information about a symbolic link file when all info callbacks resolves to null',
    async function () {
      const { file } = this.setProperties({
        file: {
          file_id: 'some_id',
          name: 'file1',
          type: FileType.SymbolicLink,
          size: 1024,
        },
        symbolicLinkTarget: () => null,
        filePath: () => null,
        fileUrl: () => null,
      });
      await render(hbs`{{atm-workflow/value-presenters/file/visual-presenter
        context=context
        value=file
      }}`);

      expect(find('.one-file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular')
        .and.to.have.class('symbolic-link-broken');
      expect(find('.file-name')).to.have.trimmed.text(file.name)
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.path-property .property-value'))
        .to.have.trimmed.text('Unknown');
      expect(find('.size-property .property-value'))
        .to.have.trimmed.text('Unknown');
    }
  );

  it('shows available information about a symbolic link file when all info callbacks rejects',
    async function () {
      const { file } = this.setProperties({
        file: {
          file_id: 'some_id',
          name: 'file1',
          type: FileType.SymbolicLink,
          size: 1024,
        },
        symbolicLinkTarget: () => reject('someError1'),
        filePath: () => reject('someError2'),
        fileUrl: () => reject('someError3'),
      });
      await render(hbs`{{atm-workflow/value-presenters/file/visual-presenter
        context=context
        value=file
      }}`);

      expect(find('.one-file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular')
        .and.to.have.class('symbolic-link-broken');
      expect(find('.file-name')).to.have.trimmed.text(file.name)
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.path-property .property-value'))
        .to.have.trimmed.text('Unknown');
      expect(find('.size-property .property-value'))
        .to.have.trimmed.text('Unknown');
    }
  );

  it('shows "Loading..." text when info callbacks are pending',
    async function () {
      const { file } = this.setProperties({
        file: {
          file_id: 'some_id',
          name: 'file1',
          type: FileType.SymbolicLink,
          size: 1024,
        },
        symbolicLinkTarget: () => new Promise(() => {}),
        filePath: () => new Promise(() => {}),
        fileUrl: () => new Promise(() => {}),
      });
      await render(hbs`{{atm-workflow/value-presenters/file/visual-presenter
        context=context
        value=file
      }}`);

      expect(find('.one-file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular')
        .and.to.not.have.class('symbolic-link-broken');
      expect(find('.file-name')).to.have.trimmed.text(file.name)
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.path-property .property-value'))
        .to.have.trimmed.text('Loading...');
      expect(find('.size-property .property-value'))
        .to.have.trimmed.text('Loading...');
    }
  );

  it('shows available information about a symbolic link file when context is not present',
    async function () {
      const { file } = this.setProperties({
        file: {
          file_id: 'some_id',
          name: 'file1',
          type: FileType.SymbolicLink,
          size: 1024,
        },
      });
      await render(hbs`{{atm-workflow/value-presenters/file/visual-presenter
        value=file
      }}`);

      expect(find('.one-file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular')
        .and.to.not.have.class('symbolic-link-broken');
      expect(find('.file-name')).to.have.trimmed.text(file.name)
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.path-property .property-value'))
        .to.have.trimmed.text('Unknown');
      expect(find('.size-property .property-value'))
        .to.have.trimmed.text('Unknown');
    }
  );
});
