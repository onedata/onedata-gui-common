import { expect } from 'chai';
import { describe, it } from 'mocha';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/datetime-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as "form-component/datetime-field"', function () {
    this.field = DatetimeField.create();
    expect(get(this.field, 'fieldComponentName'))
      .to.equal('form-component/datetime-field');
  });
});
