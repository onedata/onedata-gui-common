import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import LoginViewModel from 'onedata-gui-common/utils/login-view-model';

describe('Integration | Utility | login-view-model', function () {
  setupRenderingTest();

  it('parseFormError returns form login error info object', function () {
    const loginViewModel = LoginViewModel.create({ ownerSource: this.owner });

    const result = loginViewModel.parseFormError({
      details: {
        authError: {
          id: 'basicAuthNotSupported',
        },
      },
    });

    expect(result.isFatal).to.be.true;
    expect(String(result.message))
      .to.equal('Username & password sign-in is not supported by this Onezone.');
    expect(result.reason).to.equal('basic_auth_not_supported');
  });
});
