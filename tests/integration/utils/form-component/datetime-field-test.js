import { expect } from 'chai';
import { describe, it } from 'mocha';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/datetime-field', function () {
  setupTest();

  it('defines fieldComponentName as "form-component/datetime-field"', function () {
    const textField = DatetimeField.create();
    expect(get(textField, 'fieldComponentName'))
      .to.equal('form-component/datetime-field');
  });
});
