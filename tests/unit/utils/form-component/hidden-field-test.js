import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import HiddenField from 'onedata-gui-common/utils/form-component/hidden-field';
import { get } from '@ember/object';

describe('Unit | Utility | form-component/hidden-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines fieldComponentName as null', function () {
    this.field = HiddenField.create();
    expect(get(this.field, 'fieldComponentName')).to.be.null;
  });
});
