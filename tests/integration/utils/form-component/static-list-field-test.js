import { expect } from 'chai';
import { describe, it } from 'mocha';
import StaticListField from 'onedata-gui-common/utils/form-component/static-list-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/static-list-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as "form-component/static-list-field"', function () {
    this.field = StaticListField.create();
    expect(get(this.field, 'fieldComponentName'))
      .to.equal('form-component/static-list-field');
  });

  it('has "isValid" equal to true', function () {
    this.field = StaticListField.create();
    expect(get(this.field, 'isValid')).to.be.true;
  });
});
