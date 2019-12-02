import { expect } from 'chai';
import { describe, it } from 'mocha';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import { get } from '@ember/object';
import { setupComponentTest } from 'ember-mocha';

describe('Integration | Utility | form component/text field', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  it('defines inputType as "text"', function () {
    const textField = TextField.create();
    expect(get(textField, 'inputType')).to.equal('text');
  });

  it('defines fieldComponentName as "form-component/text-like-field"', function () {
    const textField = TextField.create();
    expect(get(textField, 'fieldComponentName'))
      .to.equal('form-component/text-like-field');
  });
});
