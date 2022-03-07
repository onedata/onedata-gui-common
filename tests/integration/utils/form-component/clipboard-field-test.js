import { expect } from 'chai';
import { describe, it } from 'mocha';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form component/clipboard field', function () {
  setupTest();

  it('defines fieldComponentName as "form-component/clipboard-field"', function () {
    const field = ClipboardField.create();
    expect(get(field, 'fieldComponentName')).to.equal('form-component/clipboard-field');
  });

  it('defines default type as "input"', function () {
    const field = ClipboardField.create();
    expect(get(field, 'type')).to.equal('input');
  });

  it('defines default textareaRows as 5', function () {
    const field = ClipboardField.create();
    expect(get(field, 'textareaRows')).to.equal(5);
  });
});
