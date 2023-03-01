import { expect } from 'chai';
import { describe, it } from 'mocha';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/tags-field', function () {
  setupTest();

  it('defines fieldComponentName as "form-component/tags-field"', function () {
    const field = TagsField.create();

    expect(get(field, 'fieldComponentName'))
      .to.equal('form-component/tags-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    const field = TagsField.create();
    expect(get(field, 'withValidationIcon')).to.be.false;
  });

  it('defines "tagEditorComponentName" as "tags-input/text-editor"', function () {
    const field = TagsField.create();

    expect(get(field, 'tagEditorComponentName'))
      .to.equal('tags-input/text-editor');
  });

  it('defines "tagEditorSettings" as undefined', function () {
    const field = TagsField.create();

    expect(get(field, 'tagEditorSettings')).to.be.undefined;
  });

  it('defines "sort" as false', function () {
    const field = TagsField.create();

    expect(get(field, 'sort')).to.be.false;
  });

  it('defines "tagsLimit" as undefined', function () {
    const field = TagsField.create();

    expect(get(field, 'tagsLimit')).to.be.undefined;
  });

  it('defines "isClearButtonVisible" as false', function () {
    const field = TagsField.create();

    expect(get(field, 'isClearButtonVisible')).to.be.false;
  });
});
