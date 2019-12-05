import { expect } from 'chai';
import { describe, it } from 'mocha';
import { get, set, getProperties } from '@ember/object';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { setupComponentTest } from 'ember-mocha';
import { validator } from 'ember-cp-validations';

describe('Integration | Utility | form component/form field', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  it('calculates label translation using path', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('some.parent.name.label')
      .returns('labelText');
    const formField = FormField.create({
      ownerSource: this,
      i18nPrefix: 'some',
      parent: {
        path: 'parent'
      },
      name: 'name',
    });

    expect(get(formField, 'label')).to.equal('labelText');
  });

  it('calculates tip translation using path', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('some.parent.name.tip')
      .returns('tipText');
    const formField = FormField.create({
      ownerSource: this,
      i18nPrefix: 'some',
      parent: {
        path: 'parent'
      },
      name: 'name',
    });

    expect(get(formField, 'tip')).to.equal('tipText');
  });

  it(
    'has falsy "isValid", not empty "errors" and "invalidFields" with reference to itself, when specified validators does not match to the field value',
    function () {
      const formField = FormField.create({
        ownerSource: this,
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
      } = getProperties(formField, 'isValid', 'errors', 'invalidFields');
      expect(isValid).to.be.false;
      expect(errors).to.be.have.length(1);
      expect(errors[0].message).to.equal('This field must be greater than 2');
      expect(invalidFields).to.have.length(1);
      expect(invalidFields[0]).to.equal(formField);
    }
  );

  it(
    'has truthy "isValid", empty "errors" and empty "invalidFields", when specified validators match to the field value',
    function () {
      const formField = FormField.create({
        ownerSource: this,
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
      } = getProperties(formField, 'isValid', 'errors', 'invalidFields');
      expect(isValid).to.be.true;
      expect(errors).to.be.have.length(0);
      expect(invalidFields).to.be.empty;
    }
  );

  it(
    'updates validator object when validators changes',
    function () {
      const formField = FormField.create({
        ownerSource: this,
        customValidators: [
          validator('number', { gt: 2 }),
        ],
        name: 'field',
        valuesSource: {
          field: 3,
        },
      });

      set(formField, 'customValidators', [
        validator('number', { gt: 4 }),
      ]);

      const {
        isValid,
        errors,
        invalidFields,
      } = getProperties(formField, 'isValid', 'errors', 'invalidFields');
      expect(isValid).to.be.false;
      expect(errors).to.be.have.length(1);
      expect(invalidFields).to.have.length(1);
      expect(invalidFields[0]).to.equal(formField);
    }
  );

  it(
    'has falsy "isOptional" field by default and notifies about validation error for empty content',
    function () {
      const formField = FormField.create({
        ownerSource: this,
      });

      const {
        isOptional,
        errors,
      } = getProperties(formField, 'isOptional', 'errors');
      expect(isOptional).to.be.false;
      expect(errors).to.be.have.length(1);
      expect(errors[0].message).to.equal('This field can\'t be blank');
    }
  );

  it(
    'does not notify about "field empty" validation error, when "isOptional" is true',
    function () {
      const formField = FormField.create({
        ownerSource: this,
        isOptional: true,
      });

      expect(get(formField, 'errors')).to.be.have.length(0);
    }
  );
});
