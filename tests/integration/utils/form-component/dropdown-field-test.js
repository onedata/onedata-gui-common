import { expect } from 'chai';
import { describe, it } from 'mocha';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { get } from '@ember/object';
import { setupComponentTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

describe('Integration | Utility | form component/dropdown field', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  it('defines fieldComponentName as "form-component/dropdown-field"', function () {
    const field = DropdownField.create();
    expect(get(field, 'fieldComponentName'))
      .to.equal('form-component/dropdown-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    const field = DropdownField.create();
    expect(get(field, 'withValidationIcon')).to.be.false;
  });

  it('translates options', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.options.one.label')
      .returns('One');

    const field = DropdownField.create({
      ownerSource: this,
      i18nPrefix: 'somePrefix',
      name: 'field1',
      options: [{
        value: 1,
        name: 'one',
      }],
    });
    get(field, 'preparedOptions');

    return wait()
      .then(() =>
        expect(get(field, 'preparedOptions.firstObject.label')).to.equal('One')
      );
  });
});
