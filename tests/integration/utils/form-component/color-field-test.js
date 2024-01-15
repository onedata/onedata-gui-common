import { expect } from 'chai';
import { describe, it } from 'mocha';
import ColorField from 'onedata-gui-common/utils/form-component/color-field';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/color-field', function () {
  setupTest();

  it('defines fieldComponentName as "form-component/color-field"', function () {
    const field = ColorField.create();
    expect(field.fieldComponentName).to.equal('form-component/color-field');
  });

  it('overrides "withValidationIcon" and "withValidationMessage" to false', function () {
    const field = ColorField.create();
    expect(field.withValidationIcon).to.be.false;
    expect(field.withValidationMessage).to.be.false;
  });
});
