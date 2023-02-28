import { expect } from 'chai';
import { describe, it } from 'mocha';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';

describe('Integration | Utility | form-component/radio-field', function () {
  setupTest();

  it('defines fieldComponentName as "form-component/radio-field"', function () {
    const field = RadioField.create();
    expect(get(field, 'fieldComponentName'))
      .to.equal('form-component/radio-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    const field = RadioField.create();
    expect(get(field, 'withValidationIcon')).to.be.false;
  });

  it('translates options', async function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.options.one.label')
      .returns('One');

    const field = RadioField.create({
      ownerSource: this.owner,
      i18nPrefix: 'somePrefix',
      name: 'field1',
      options: [{
        value: 1,
        name: 'one',
      }],
    });
    get(field, 'preparedOptions');

    await settled();
    expect(get(field, 'preparedOptions.firstObject.label')).to.equal('One');
  });
});
