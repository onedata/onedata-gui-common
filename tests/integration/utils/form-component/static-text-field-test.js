import { expect } from 'chai';
import { describe, it } from 'mocha';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';

describe('Integration | Utility | form-component/static-text-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as "form-component/static-text-field"', function () {
    this.field = StaticTextField.create();
    expect(get(this.field, 'fieldComponentName'))
      .to.equal('form-component/static-text-field');
  });

  it('has "isValid" equal to true', function () {
    this.field = StaticTextField.create();
    expect(get(this.field, 'isValid')).to.be.true;
  });

  it('has text property set to "text" translation by default', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('some.parent.name.text')
      .returns('someText');

    this.field = StaticTextField.create({
      ownerSource: this.owner,
      i18nPrefix: 'some',
      parent: {
        translationPath: 'parent',
      },
      name: 'name',
    });

    expect(get(this.field, 'text')).to.equal('someText');
  });
});
