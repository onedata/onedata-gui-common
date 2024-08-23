import { expect } from 'chai';
import { describe, it } from 'mocha';
import loginViewModel from 'onedata-gui-common/utils/login-view-model';

describe('Unit | Utility | login-view-model', function() {
  // Replace this with your real tests.
  it('works', function() {
    let result = loginViewModel();
    expect(result).to.be.ok;
  });
});
