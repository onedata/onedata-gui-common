import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';
import { FileType, SymbolicLinkTargetType } from 'onedata-gui-common/utils/file';

describe('Integration | Component | file icon', function () {
  setupRenderingTest('file-icon');

  it('has class "file-icon"', async function () {
    await render(hbs`{{file-icon}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('file-icon');
  });

  it('shows regular file icon and has "main-type-regular" class for regular file type', async function () {
    this.set('fileType', FileType.Regural);
    await render(hbs`{{file-icon fileType=fileType}}`);

    expect(find('.file-icon')).to.have.class('main-type-regular');
    expect(find('.one-icon-tagged-main')).to.have.class('oneicon-browser-file');
    expect(find('.one-icon-tag')).to.not.exist;
  });

  it('shows directory file icon and has "main-type-directory" class for directory file type', async function () {
    this.set('fileType', FileType.Directory);
    await render(hbs`{{file-icon fileType=fileType}}`);

    expect(find('.file-icon')).to.have.class('main-type-directory');
    expect(find('.one-icon-tagged-main')).to.have.class('oneicon-browser-directory');
    expect(find('.one-icon-tag')).to.not.exist;
  });

  it('shows regular file icon and has "main-type-symbolic-link effective-type-regular" classes for symbolic link file type and not defined target type',
    async function () {
      this.set('fileType', FileType.SymbolicLink);
      await render(hbs`{{file-icon fileType=fileType}}`);

      expect(find('.file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular')
        .and.to.not.have.class('symbolic-link-broken');
      expect(find('.one-icon-tagged-main')).to.have.class('oneicon-browser-file');
      expect(find('.one-icon-tag')).to.have.class('oneicon-shortcut');
    }
  );

  it('shows regular file icon and has "main-type-symbolic-link effective-type-regular" classes for symbolic link file type and regular target type',
    async function () {
      this.setProperties({
        fileType: FileType.SymbolicLink,
        symbolicLinkTargetType: SymbolicLinkTargetType.Regular,
      });
      await render(hbs`{{file-icon
        fileType=fileType
        symbolicLinkTargetType=symbolicLinkTargetType
      }}`);

      expect(find('.file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular');
      expect(find('.one-icon-tagged-main')).to.have.class('oneicon-browser-file');
      expect(find('.one-icon-tag')).to.have.class('oneicon-shortcut');
    }
  );

  it('shows directory file icon and has "main-type-symbolic-link effective-type-directory" classes for symbolic link file type and directory target type',
    async function () {
      this.setProperties({
        fileType: FileType.SymbolicLink,
        symbolicLinkTargetType: SymbolicLinkTargetType.Directory,
      });
      await render(hbs`{{file-icon
        fileType=fileType
        symbolicLinkTargetType=symbolicLinkTargetType
      }}`);

      expect(find('.file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-directory');
      expect(find('.one-icon-tagged-main')).to.have.class('oneicon-browser-directory');
      expect(find('.one-icon-tag')).to.have.class('oneicon-shortcut');
    }
  );

  it('shows regular file icon, error tag and has "main-type-symbolic-link effective-type-regular symbolic-link-broken" classes for symbolic link file type and null target type',
    async function () {
      this.setProperties({
        fileType: FileType.SymbolicLink,
        symbolicLinkTargetType: SymbolicLinkTargetType.Broken,
      });
      await render(hbs`{{file-icon
        fileType=fileType
        symbolicLinkTargetType=symbolicLinkTargetType
      }}`);

      expect(find('.file-icon')).to.have.class('main-type-symbolic-link')
        .and.to.have.class('effective-type-regular')
        .and.to.have.class('symbolic-link-broken');
      expect(find('.one-icon-tagged-main')).to.have.class('oneicon-browser-file');
      expect(find('.one-icon-tag')).to.have.class('oneicon-x');
    }
  );
});
