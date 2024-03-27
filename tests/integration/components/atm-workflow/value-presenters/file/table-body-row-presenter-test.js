import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find, findAll } from '@ember/test-helpers';
import { Promise, reject } from 'rsvp';
import { FileType } from 'onedata-gui-common/utils/file';

describe('Integration | Component | atm-workflow/value-presenters/file/table-body-row-presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      context: {
        getSymbolicLinkTargetById: async (id) => this.get('symbolicLinkTarget')(id),
        getFilePathById: async (id) => this.get('filePath')(id),
        getFileUrlById: async (id) => this.get('fileUrl')(id),
      },
      symbolicLinkTarget: (id) => ({
        fileId: `target-${id}`,
        type: FileType.Directory,
        size: 512,
      }),
      filePath: (id) => `/a/b/c-${id}`,
      fileUrl: (id) => `/some/url-${id}`,
    });
  });

  it('has classes "table-body-row-presenter" and "file-table-body-row-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/file/table-body-row-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('table-body-row-presenter')
      .and.to.have.class('file-table-body-row-presenter');
  });

  it('shows three columns - name, path and size', async function () {
    await render(hbs`{{atm-workflow/value-presenters/file/table-body-row-presenter}}`);

    const tds = findAll('.table-body-row-presenter td');
    expect(tds).to.have.length(3);
    expect(tds[0]).to.have.class('column-name');
    expect(tds[1]).to.have.class('column-path');
    expect(tds[2]).to.have.class('column-size');
  });

  it('shows complete information about a regular file', async function () {
    const file = this.set('file', {
      fileId: 'some_id',
      name: 'file1',
      type: FileType.Regular,
      size: 1024,
    });
    await render(hbs`{{atm-workflow/value-presenters/file/table-body-row-presenter
      context=context
      value=file
    }}`);

    expect(find('.column-name .one-file-icon')).to.have.class('main-type-regular');
    expect(find('.column-name .file-name')).to.have.trimmed.text(file.name)
      .and.to.match('a')
      .and.to.have.attr('href', this.get('fileUrl')(this.get('file.fileId')));
    expect(find('.column-path'))
      .to.have.trimmed.text(this.get('filePath')(this.get('file.fileId')));
    expect(find('.column-size'))
      .to.have.trimmed.text('1 KiB');
  });

  it('handles case when all file properties are missing', async function () {
    this.set('file', null);
    await render(hbs`{{atm-workflow/value-presenters/file/table-body-row-presenter
      context=context
      value=file
    }}`);

    expect(find('.column-name .one-file-icon')).to.have.class('main-type-regular');
    expect(find('.column-name .file-name')).to.have.trimmed.text('Unknown')
      .and.to.match('span')
      .and.to.not.have.attr('href');
    expect(find('.column-path')).to.have.trimmed.text('Unknown');
    expect(find('.column-size')).to.have.trimmed.text('Unknown');
  });

  it('handles case when all file properties are missing except ID', async function () {
    this.set('file', {
      fileId: 'some_id',
    });
    await render(hbs`{{atm-workflow/value-presenters/file/table-body-row-presenter
      context=context
      value=file
    }}`);

    expect(find('.column-name .one-file-icon')).to.have.class('main-type-regular');
    expect(find('.column-name .file-name')).to.have.trimmed.text('Unknown')
      .and.to.match('a')
      .and.to.have.attr('href', this.get('fileUrl')(this.get('file.fileId')));
    expect(find('.column-path'))
      .to.have.trimmed.text(this.get('filePath')(this.get('file.fileId')));
    expect(find('.column-size')).to.have.trimmed.text('Unknown');
  });

  it('shows complete information about a symbolic link file', async function () {
    const file = this.set('file', {
      fileId: 'some_id',
      name: 'file1',
      type: FileType.SymbolicLink,
      size: 1024,
    });
    await render(hbs`{{atm-workflow/value-presenters/file/table-body-row-presenter
      context=context
      value=file
    }}`);

    expect(find('.column-name .one-file-icon')).to.have.class('main-type-symbolic-link')
      .and.to.have.class('effective-type-directory');
    expect(find('.column-name .file-name')).to.have.trimmed.text(file.name)
      .and.to.match('a')
      .and.to.have.attr('href', this.get('fileUrl')(this.get('file.fileId')));
    expect(find('.column-path'))
      .to.have.trimmed.text(this.get('filePath')(this.get('file.fileId')));
    expect(find('.column-size')).to.have.trimmed.text('512 B');
  });

  it('shows available information about a symbolic link file when all info callbacks resolves to null',
    async function () {
      const { file } = this.setProperties({
        file: {
          fileId: 'some_id',
          name: 'file1',
          type: FileType.SymbolicLink,
          size: 1024,
        },
        symbolicLinkTarget: () => null,
        filePath: () => null,
        fileUrl: () => null,
      });
      await render(hbs`{{atm-workflow/value-presenters/file/table-body-row-presenter
        context=context
        value=file
      }}`);

      expect(find('.column-name .one-file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular')
        .and.to.have.class('symbolic-link-broken');
      expect(find('.column-name .file-name')).to.have.trimmed.text(file.name)
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.column-path')).to.have.trimmed.text('Unknown');
      expect(find('.column-size')).to.have.trimmed.text('Unknown');
    }
  );

  it('shows available information about a symbolic link file when all info callbacks rejects',
    async function () {
      const { file } = this.setProperties({
        file: {
          fileId: 'some_id',
          name: 'file1',
          type: FileType.SymbolicLink,
          size: 1024,
        },
        symbolicLinkTarget: () => reject('someError1'),
        filePath: () => reject('someError2'),
        fileUrl: () => reject('someError3'),
      });
      await render(hbs`{{atm-workflow/value-presenters/file/table-body-row-presenter
        context=context
        value=file
      }}`);

      expect(find('.column-name .one-file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular')
        .and.to.have.class('symbolic-link-broken');
      expect(find('.column-name .file-name')).to.have.trimmed.text(file.name)
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.column-path')).to.have.trimmed.text('Unknown');
      expect(find('.column-size')).to.have.trimmed.text('Unknown');
    }
  );

  it('shows "Loading..." text when info callbacks are pending',
    async function () {
      const { file } = this.setProperties({
        file: {
          fileId: 'some_id',
          name: 'file1',
          type: FileType.SymbolicLink,
          size: 1024,
        },
        symbolicLinkTarget: () => new Promise(() => {}),
        filePath: () => new Promise(() => {}),
        fileUrl: () => new Promise(() => {}),
      });
      await render(hbs`{{atm-workflow/value-presenters/file/table-body-row-presenter
        context=context
        value=file
      }}`);

      expect(find('.column-name .one-file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular')
        .and.to.not.have.class('symbolic-link-broken');
      expect(find('.column-name .file-name')).to.have.trimmed.text(file.name)
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.column-path')).to.have.trimmed.text('Loading...');
      expect(find('.column-size')).to.have.trimmed.text('Loading...');
    }
  );

  it('shows available information about a symbolic link file when context is not present',
    async function () {
      const { file } = this.setProperties({
        file: {
          fileId: 'some_id',
          name: 'file1',
          type: FileType.SymbolicLink,
          size: 1024,
        },
      });
      await render(hbs`{{atm-workflow/value-presenters/file/table-body-row-presenter
        value=file
      }}`);

      expect(find('.column-name .one-file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular')
        .and.to.not.have.class('symbolic-link-broken');
      expect(find('.column-name .file-name')).to.have.trimmed.text(file.name)
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.column-path')).to.have.trimmed.text('Unknown');
      expect(find('.column-size')).to.have.trimmed.text('Unknown');
    }
  );
});
