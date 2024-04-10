import { expect } from 'chai';
import { describe, it } from 'mocha';
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import { get, set } from '@ember/object';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';

describe('Integration | Utility | form-component/json-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as "form-component/json-field"', function () {
    this.field = JsonField.create();
    expect(get(this.field, 'fieldComponentName'))
      .to.equal('form-component/json-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    this.field = JsonField.create();
    expect(get(this.field, 'withValidationIcon')).to.be.false;
  });

  it(
    'notifies about validation error when json is not valid',
    function () {
      this.field = JsonField.create({
        ownerSource: this.owner,
      });
      set(this.field, 'value', '{}x');

      const errors = get(this.field, 'errors');
      expect(errors).to.be.have.length(1);
      expect(errors[0].message).to.equal('JSON is not valid');
    }
  );

  it('translates placeholder', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.placeholder')
      .returns('field tip');

    this.field = JsonField.create({
      ownerSource: this.owner,
      i18nPrefix: 'somePrefix',
      name: 'field1',
    });

    expect(get(this.field, 'placeholder')).to.equal('field tip');
  });

  it('has empty placeholder if translation for it cannot be found', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.placeholder')
      .returns('<missing-...');

    this.field = JsonField.create({
      ownerSource: this.owner,
      i18nPrefix: 'somePrefix',
      name: 'field1',
    });

    expect(get(this.field, 'placeholder')).to.be.empty;
  });
});
