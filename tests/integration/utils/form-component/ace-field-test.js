import { expect } from 'chai';
import { describe, it } from 'mocha';
import AceField from 'onedata-gui-common/utils/form-component/ace-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/ace-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as "form-component/ace-field"', function () {
    this.field = AceField.create();
    expect(get(this.field, 'fieldComponentName'))
      .to.equal('form-component/ace-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    this.field = AceField.create();
    expect(get(this.field, 'withValidationIcon')).to.be.false;
  });

  it('has undefined "lang" by default', function () {
    this.field = AceField.create();
    expect(get(this.field, 'lang')).to.be.undefined;
  });
});
