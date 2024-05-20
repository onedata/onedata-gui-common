import { expect } from 'chai';
import { describe, it } from 'mocha';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';

describe('Integration | Utility | form-component/radio-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as "form-component/radio-field"', function () {
    this.field = RadioField.create();
    expect(get(this.field, 'fieldComponentName'))
      .to.equal('form-component/radio-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    this.field = RadioField.create();
    expect(get(this.field, 'withValidationIcon')).to.be.false;
  });

  it('translates options', async function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.options.one.label')
      .returns('One');

    this.field = RadioField.create({
      ownerSource: this.owner,
      i18nPrefix: 'somePrefix',
      name: 'field1',
      options: [{
        value: 1,
        name: 'one',
      }],
    });
    get(this.field, 'preparedOptions');

    await settled();
    expect(get(this.field, 'preparedOptions.firstObject.label')).to.equal('One');
  });
});
