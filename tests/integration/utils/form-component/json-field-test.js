import { expect } from 'chai';
import { describe, it } from 'mocha';
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import { get, set } from '@ember/object';
import { setupComponentTest } from 'ember-mocha';

describe('Integration | Utility | form component/json field', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  it('defines fieldComponentName as "form-component/json-field"', function () {
    const textField = JsonField.create();
    expect(get(textField, 'fieldComponentName'))
      .to.equal('form-component/json-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    const field = JsonField.create();
    expect(get(field, 'withValidationIcon')).to.be.false;
  });

  it(
    'notifies about validation error when json is not valid',
    function () {
      const formField = JsonField.create({
        ownerSource: this,
      });
      set(formField, 'value', '{}x');

      const errors = get(formField, 'errors');
      expect(errors).to.be.have.length(1);
      expect(errors[0].message).to.equal('JSON is not valid');
    }
  );
});
