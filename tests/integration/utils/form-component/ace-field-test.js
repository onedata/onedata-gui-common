import { expect } from 'chai';
import { describe, it } from 'mocha';
import AceField from 'onedata-gui-common/utils/form-component/ace-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/ace-field', function () {
  setupTest();

  it('defines fieldComponentName as "form-component/ace-field"', function () {
    const field = AceField.create();
    expect(get(field, 'fieldComponentName'))
      .to.equal('form-component/ace-field');
  });

  it('overrides "withValidationIcon" to false', function () {
    const field = AceField.create();
    expect(get(field, 'withValidationIcon')).to.be.false;
  });

  it('has undefined "lang" by default', function () {
    const field = AceField.create();
    expect(get(field, 'lang')).to.be.undefined;
  });
});
