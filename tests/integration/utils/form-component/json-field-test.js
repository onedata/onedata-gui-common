import { expect } from 'chai';
import { describe, it } from 'mocha';
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import { get, set } from '@ember/object';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';

describe('Integration | Utility | form-component/json-field', function () {
  setupTest();

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
        ownerSource: this.owner,
      });
      set(formField, 'value', '{}x');

      const errors = get(formField, 'errors');
      expect(errors).to.be.have.length(1);
      expect(errors[0].message).to.equal('JSON is not valid');
    }
  );

  it('translates placeholder', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.placeholder')
      .returns('field tip');

    const field = JsonField.create({
      ownerSource: this.owner,
      i18nPrefix: 'somePrefix',
      name: 'field1',
    });

    expect(get(field, 'placeholder')).to.equal('field tip');
  });

  it('has empty placeholder if translation for it cannot be found', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.placeholder')
      .returns('<missing-...');

    const field = JsonField.create({
      ownerSource: this.owner,
      i18nPrefix: 'somePrefix',
      name: 'field1',
    });

    expect(get(field, 'placeholder')).to.be.empty;
  });
});
