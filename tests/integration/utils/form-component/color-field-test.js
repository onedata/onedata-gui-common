import { expect } from 'chai';
import { describe, it } from 'mocha';
import ColorField from 'onedata-gui-common/utils/form-component/color-field';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/color-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as "form-component/color-field"', function () {
    this.field = ColorField.create();
    expect(this.field.fieldComponentName).to.equal('form-component/color-field');
  });

  it('overrides "withValidationIcon" and "withValidationMessage" to false', function () {
    this.field = ColorField.create();
    expect(this.field.withValidationIcon).to.be.false;
    expect(this.field.withValidationMessage).to.be.false;
  });
});
