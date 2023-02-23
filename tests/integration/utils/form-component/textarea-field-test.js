import { expect } from 'chai';
import { describe, it } from 'mocha';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';

describe('Integration | Utility | form-component/textarea-field', function () {
  setupTest();

  it('defines fieldComponentName as "form-component/textarea-field"', function () {
    const field = TextareaField.create();
    expect(field.fieldComponentName).to.equal('form-component/textarea-field');
  });

  it('translates placeholder', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.placeholder')
      .returns('field tip');

    const field = TextareaField.create({
      ownerSource: this.owner,
      i18nPrefix: 'somePrefix',
      name: 'field1',
    });

    expect(field.placeholder).to.equal('field tip');
  });

  it('has empty placeholder if translation for it cannot be found', function () {
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('somePrefix.field1.placeholder')
      .returns('<missing-...');

    const field = TextareaField.create({
      ownerSource: this.owner,
      i18nPrefix: 'somePrefix',
      name: 'field1',
    });

    expect(field.placeholder).to.be.empty;
  });

  it('has "showsStaticTextInViewMode" equal to false', function () {
    const field = TextareaField.create();
    expect(field.showsStaticTextInViewMode).to.be.false;
  });

  ['rows', 'cols'].forEach((propName) => {
    it(`has "${propName}" equal to null`, function () {
      const field = TextareaField.create();
      expect(field[propName]).to.be.null;
    });
  });
});
