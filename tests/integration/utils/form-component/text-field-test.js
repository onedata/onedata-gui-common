import { expect } from 'chai';
import { describe, it } from 'mocha';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import { get } from '@ember/object';
import { setupComponentTest } from 'ember-mocha';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';

describe('Integration | Utility | form component/text field', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  it('defines inputType as "text"', function () {
    const textField = TextField.create();
    expect(get(textField, 'inputType')).to.equal('text');
  });

  it('defines fieldComponentName as "form-component/text-like-field"', function () {
    const textField = TextField.create();
    expect(get(textField, 'fieldComponentName'))
      .to.equal('form-component/text-like-field');
  });

  it(
    'has empty "regex" field by default',
    function () {
      const textField = TextField.create();

      expect(get(textField, 'regex')).to.be.undefined;
    }
  );

  it(
    'has format validation error when regex is defined and value does not match',
    function () {
      const textField = TextField.create({
        ownerSource: this,
        regex: /^abc$/,
        name: 'a',
        valuesSource: {
          a: 'abd',
        },
      });

      const errors = get(textField, 'errors');
      expect(errors).to.be.have.length(1);
      expect(errors[0].message).to.equal('This field is invalid');
    }
  );

  it(
    'does not have format validation error when regex is defined and value matches',
    function () {
      const textField = TextField.create({
        ownerSource: this,
        regex: /^abc$/,
        name: 'a',
        valuesSource: {
          a: 'abc',
        },
      });

      expect(get(textField, 'errors')).to.be.have.length(0);
    }
  );

  it(
    'does not have validation error when regex is defined, isOptional is true and value is empty',
    function () {
      const textField = TextField.create({
        ownerSource: this,
        isOptional: true,
        regex: /^abc$/,
      });

      expect(get(textField, 'errors')).to.be.have.length(0);
    }
  );

  it('translates placeholder', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.placeholder')
      .returns('field tip');

    const field = TextField.create({
      ownerSource: this,
      i18nPrefix: 'somePrefix',
      name: 'field1',
    });

    expect(get(field, 'placeholder')).to.equal('field tip');
  });

  it('has undefined placeholder if translation for it cannot be found', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.placeholder')
      .returns('<missing-...');

    const field = TextField.create({
      ownerSource: this,
      i18nPrefix: 'somePrefix',
      name: 'field1',
    });

    expect(get(field, 'placeholder')).to.be.undefined;
  });
});
