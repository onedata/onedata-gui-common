import { expect } from 'chai';
import { describe, it } from 'mocha';
import HiddenField from 'onedata-gui-common/utils/form-component/hidden-field';
import { get } from '@ember/object';

describe('Unit | Utility | form-component/hidden-field', function () {
  it('defines fieldComponentName as null', function () {
    const field = HiddenField.create();
    expect(get(field, 'fieldComponentName')).to.be.null;
  });
});
