import { expect } from 'chai';
import { describe, it } from 'mocha';
import { get } from '@ember/object';
import FormFieldValidator from 'onedata-gui-common/utils/form-component/form-field-validator';
import { validator, buildValidations } from 'ember-cp-validations';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form component/form field validator', function () {
  setupTest();

  it(
    'has empty errors array and truthy isValid when no validators are used',
    function () {
      const fieldValidator = FormFieldValidator
        .extend(buildValidations())
        .create({ ownerSource: this.owner });

      expect(get(fieldValidator, 'errors')).to.have.length(0);
      expect(get(fieldValidator, 'isValid')).to.be.true;
    }
  );

  it('reports injected validators errors through "errors" property', function () {
    const validators = [
      validator('number', {
        gt: 2,
      }),
    ];
    const fieldValidator = FormFieldValidator
      .extend(buildValidations({ value: validators }))
      .create({
        ownerSource: this.owner,
        value: 1,
      });

    const errors = get(fieldValidator, 'errors');
    expect(errors).to.have.length(1);
    expect(errors[0].message).to.equal('This field must be greater than 2');
    expect(get(fieldValidator, 'isValid')).to.be.false;
  });

  it(
    'does not report any error for injected validators when value is valid',
    function () {
      const validators = [
        validator('number', {
          gt: 2,
        }),
      ];
      const fieldValidator = FormFieldValidator
        .extend(buildValidations({ value: validators }))
        .create({
          ownerSource: this.owner,
          value: 3,
        });

      expect(get(fieldValidator, 'errors')).to.have.length(0);
      expect(get(fieldValidator, 'isValid')).to.be.true;
    }
  );

  it(
    'sets value and valuesSource fields using passed form field instance',
    function () {
      const fieldValidator = FormFieldValidator
        .extend(buildValidations())
        .create({
          ownerSource: this.owner,
          field: {
            value: 'a',
            valuesSource: 'b',
          },
        });

      expect(get(fieldValidator, 'value')).to.equal('a');
      expect(get(fieldValidator, 'valuesSource')).to.equal('b');
    }
  );
});
