import { expect } from 'chai';
import { describe, it } from 'mocha';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import { get } from '@ember/object';
import { setupComponentTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';

describe('Integration | Utility | form component/static text field', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  it('defines fieldComponentName as "form-component/static-text-field"', function () {
    const field = StaticTextField.create();
    expect(get(field, 'fieldComponentName'))
      .to.equal('form-component/static-text-field');
  });

  it('has "isValid" equal to true', function () {
    const field = StaticTextField.create();
    expect(get(field, 'isValid')).to.be.true;
  });

  it('has text property set to "text" translation by default', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('some.parent.name.text')
      .returns('someText');

    const field = StaticTextField.create({
      ownerSource: this,
      i18nPrefix: 'some',
      parent: {
        translationPath: 'parent',
      },
      name: 'name',
    });

    expect(get(field, 'text')).to.equal('someText');
  });
});
