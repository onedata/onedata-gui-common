import { expect } from 'chai';
import { describe, it } from 'mocha';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/tags-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as "form-component/tags-field"', function () {
    this.field = TagsField.create();

    expect(get(this.field, 'fieldComponentName'))
      .to.equal('form-component/tags-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    this.field = TagsField.create();
    expect(get(this.field, 'withValidationIcon')).to.be.false;
  });

  it('defines "tagEditorComponentName" as "tags-input/text-editor"', function () {
    this.field = TagsField.create();

    expect(get(this.field, 'tagEditorComponentName'))
      .to.equal('tags-input/text-editor');
  });

  it('defines "tagEditorSettings" as undefined', function () {
    this.field = TagsField.create();

    expect(get(this.field, 'tagEditorSettings')).to.be.undefined;
  });

  it('defines "sort" as false', function () {
    this.field = TagsField.create();

    expect(get(this.field, 'sort')).to.be.false;
  });

  it('defines "tagsLimit" as undefined', function () {
    this.field = TagsField.create();

    expect(get(this.field, 'tagsLimit')).to.be.undefined;
  });

  it('defines "isClearButtonVisible" as false', function () {
    this.field = TagsField.create();

    expect(get(this.field, 'isClearButtonVisible')).to.be.false;
  });
});
