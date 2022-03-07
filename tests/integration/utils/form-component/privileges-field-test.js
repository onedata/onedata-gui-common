import { expect } from 'chai';
import { describe, it } from 'mocha';
import PrivilegesField from 'onedata-gui-common/utils/form-component/privileges-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form component/privileges field', function () {
  setupTest();

  it('defines fieldComponentName as "form-component/privileges-field"', function () {
    const field = PrivilegesField.create();
    expect(get(field, 'fieldComponentName'))
      .to.equal('form-component/privileges-field');
  });

  it('overrides withValidationIcon to false', function () {
    const field = PrivilegesField.create();
    expect(get(field, 'withValidationIcon')).to.be.false;
  });

  it('has empty privilegesGroups by default', function () {
    const field = PrivilegesField.create();
    expect(get(field, 'privilegesGroups')).to.an('array').that.is.empty;
  });

  it('overrides defaultValue to []', function () {
    const field = PrivilegesField.create();
    expect(get(field, 'defaultValue')).to.an('array').that.is.empty;
  });
});
