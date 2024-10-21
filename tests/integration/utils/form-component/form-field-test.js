import { expect } from 'chai';
import { describe, it } from 'mocha';
import { get, set, getProperties } from '@ember/object';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { setupTest } from 'ember-mocha';
import { validator } from 'ember-cp-validations';
import sinon from 'sinon';

describe('Integration | Utility | form-component/form-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
    this.field.parent?.destroy();
  });

  it(
    'has falsy "isValid", not empty "errors" and "invalidFields" with reference to itself, when specified validators does not match to the field value',
    function () {
      this.field = FormField.create({
        ownerSource: this.owner,
        customValidators: [
          validator('number', { gt: 2 }),
        ],
        name: 'field',
        valuesSource: {
          field: 1,
        },
      });

      const {
        isValid,
        errors,
        invalidFields,
      } = getProperties(this.field, 'isValid', 'errors', 'invalidFields');
      expect(isValid).to.be.false;
      expect(errors).to.be.have.length(1);
      expect(errors[0].message).to.equal('This field must be greater than 2');
      expect(invalidFields).to.have.length(1);
      expect(invalidFields[0]).to.equal(this.field);
    }
  );

  it(
    'has truthy "isValid", empty "errors" and empty "invalidFields", when specified validators match to the field value',
    function () {
      this.field = FormField.create({
        ownerSource: this.owner,
        customValidators: [
          validator('number', { gt: 2 }),
        ],
        name: 'field',
        valuesSource: {
          field: 3,
        },
      });

      const {
        isValid,
        errors,
        invalidFields,
      } = getProperties(this.field, 'isValid', 'errors', 'invalidFields');
      expect(isValid).to.be.true;
      expect(errors).to.be.have.length(0);
      expect(invalidFields).to.be.empty;
    }
  );

  it(
    'has truthy "isValid", empty "errors" and empty "invalidFields", when specified validators does not match to the field value but isValuess is true',
    function () {
      this.field = FormField.create({
        ownerSource: this.owner,
        customValidators: [
          validator('number', { gt: 2 }),
        ],
        name: 'field',
        valuesSource: {
          field: 1,
        },
        isValueless: true,
      });

      const {
        isValid,
        errors,
        invalidFields,
      } = getProperties(this.field, 'isValid', 'errors', 'invalidFields');
      expect(isValid).to.be.true;
      expect(errors).to.be.have.length(0);
      expect(invalidFields).to.be.empty;
    }
  );

  it(
    'updates validator object when validators changes',
    function () {
      this.field = FormField.create({
        ownerSource: this.owner,
        customValidators: [
          validator('number', { gt: 2 }),
        ],
        name: 'field',
        valuesSource: {
          field: 3,
        },
      });

      set(this.field, 'customValidators', [
        validator('number', { gt: 4 }),
      ]);

      const {
        isValid,
        errors,
        invalidFields,
      } = getProperties(this.field, 'isValid', 'errors', 'invalidFields');
      expect(isValid).to.be.false;
      expect(errors).to.be.have.length(1);
      expect(invalidFields).to.have.length(1);
      expect(invalidFields[0]).to.equal(this.field);
    }
  );

  it(
    'has falsy "isOptional" field by default and notifies about validation error for empty content',
    function () {
      this.field = FormField.create({
        ownerSource: this.owner,
      });

      const {
        isOptional,
        errors,
      } = getProperties(this.field, 'isOptional', 'errors');
      expect(isOptional).to.be.false;
      expect(errors).to.be.have.length(1);
      expect(errors[0].message).to.equal('This field can\'t be blank');
    }
  );

  it(
    'does not notify about "field empty" validation error, when "isOptional" is true',
    function () {
      this.field = FormField.create({
        ownerSource: this.owner,
        isOptional: true,
      });

      expect(get(this.field, 'errors')).to.be.have.length(0);
    }
  );

  it(
    'does not allow to change isModified flag to true using markAsModified() when isValueless is true',
    function () {
      this.field = FormField.create({
        isValueless: true,
      });

      this.field.markAsModified();

      expect(get(this.field, 'isModified')).to.equal(false);
    }
  );

  it('does not notify about value change when isValueless is true', function () {
    this.field = FormField.create({
      parent: FormField.create({
        name: 'parent',
      }),
      name: 'child',
      isValueless: true,
    });
    const onChangeSpy = sinon.spy(get(this.field, 'parent'), 'onValueChange');

    this.field.valueChanged('new');
    expect(onChangeSpy).to.not.be.called;
  });

  it('returns undefined as a dumpValue() result when isValueless is true', function () {
    this.field = FormField.create({
      name: 'a',
      valuesSource: {
        a: 'b',
      },
      isValueless: true,
    });

    expect(this.field.dumpValue()).to.be.undefined;
  });

  it(
    'returns undefined as a dumpDefaultValue() result when isValueless is true',
    function () {
      this.field = FormField.create({
        defaultValue: 'a',
        isValueless: true,
      });

      expect(this.field.dumpDefaultValue()).to.be.undefined;
    }
  );

  it(
    'is valid when value is invalid, but mode is "view"',
    function () {
      this.field = FormField.create({
        ownerSource: this.owner,
        customValidators: [
          validator('number', { gt: 2 }),
        ],
        name: 'field',
        valuesSource: {
          field: 1,
        },
      });
      this.field.changeMode('view');

      const {
        isValid,
        invalidFields,
      } = getProperties(this.field, 'isValid', 'invalidFields');
      expect(isValid).to.be.true;
      expect(invalidFields).to.be.empty;
    }
  );
});
