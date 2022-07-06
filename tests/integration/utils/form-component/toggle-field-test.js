import { expect } from 'chai';
import { describe, it } from 'mocha';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form component/toggle field', function () {
  setupTest();

  it('defines fieldComponentName as "form-component/toggle-field"', function () {
    const field = ToggleField.create();
    expect(get(field, 'fieldComponentName'))
      .to.equal('form-component/toggle-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    const field = ToggleField.create();
    expect(get(field, 'withValidationIcon')).to.be.false;
  });

  it('has undefined "disabledControlTip" by default', function () {
    const field = ToggleField.create();
    expect(get(field, 'disabledControlTip')).to.be.undefined;
  });
});
