import { expect } from 'chai';
import { describe, it } from 'mocha';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/toggle-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as "form-component/toggle-field"', function () {
    this.field = ToggleField.create();
    expect(get(this.field, 'fieldComponentName'))
      .to.equal('form-component/toggle-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    this.field = ToggleField.create();
    expect(get(this.field, 'withValidationIcon')).to.be.false;
  });

  it('has undefined "disabledControlTip" by default', function () {
    this.field = ToggleField.create();
    expect(get(this.field, 'disabledControlTip')).to.be.undefined;
  });
});
