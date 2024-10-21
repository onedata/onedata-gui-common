import { expect } from 'chai';
import { describe, it } from 'mocha';
import PrivilegesField from 'onedata-gui-common/utils/form-component/privileges-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/privileges-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as "form-component/privileges-field"', function () {
    this.field = PrivilegesField.create();
    expect(get(this.field, 'fieldComponentName'))
      .to.equal('form-component/privileges-field');
  });

  it('overrides withValidationIcon to false', function () {
    this.field = PrivilegesField.create();
    expect(get(this.field, 'withValidationIcon')).to.be.false;
  });

  it('has empty privilegesGroups by default', function () {
    this.field = PrivilegesField.create();
    expect(get(this.field, 'privilegesGroups')).to.an('array').that.is.empty;
  });

  it('overrides defaultValue to the empty privileges representation', function () {
    this.field = PrivilegesField.create();
    expect(get(this.field, 'defaultValue')).to.deep.equal({
      privilegesTarget: undefined,
      privileges: [],
    });
  });
});
