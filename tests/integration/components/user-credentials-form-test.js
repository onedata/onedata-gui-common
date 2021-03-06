import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import FormHelper from 'dummy/tests/helpers/form';

class UserCredentialsFormHelper extends FormHelper {
  constructor($template) {
    super($template, '.user-credentials-form');
  }
}

describe('Integration | Component | user credentials form', function () {
  setupComponentTest('user-credentials-form', {
    integration: true,
  });

  it('shows secret password field by default', function () {
    this.render(hbs `{{user-credentials-form}}`);

    let form = new UserCredentialsFormHelper(this.$());

    expect(form.getInput('static-secretPassword'), 'secret password field exists')
      .to.exist;
  });

  it(
    'shows old password, new password and retype new password fields in change password mode',
    function (done) {
      this.render(hbs `{{user-credentials-form changingPassword=true}}`);

      let form = new UserCredentialsFormHelper(this.$());

      expect(form.getInput('static-secretPassword'), 'secret pass field')
        .to.not.exist;
      expect(form.getInput('verify-currentPassword'), 'current password field')
        .to.exist;
      expect(form.getInput('change-newPassword'), 'new password field')
        .to.exist;
      expect(form.getInput('change-newPasswordRetype'), 'new pass retype field')
        .to.exist;

      done();
    }
  );

  it('submits current and new password', function (done) {
    const OLD_PASSWORD = 'one123456789';
    const NEW_PASSWORD = 'one987654321';

    let submitted = false;
    this.on('submit', function ({ currentPassword, newPassword }) {
      expect(currentPassword).to.be.equal(OLD_PASSWORD);
      expect(newPassword).to.be.equal(NEW_PASSWORD);
      submitted = true;
    });

    this.render(hbs `
    {{user-credentials-form
      changingPassword=true
      submit=(action "submit")
    }}
    `);

    let form = new UserCredentialsFormHelper(this.$());

    form.getInput('verify-currentPassword').val(OLD_PASSWORD).change();
    form.getInput('change-newPassword').val(NEW_PASSWORD).change();
    form.getInput('change-newPasswordRetype').val(NEW_PASSWORD).change();

    wait().then(() => {
      this.$('button[type=submit]').click();
      wait({ waitForTimers: true }).then(() => {
        expect(submitted).to.be.true;
        done();
      });
    });
  });

  it('disabled submit button when new passwords do not match', function (done) {
    const OLD_PASSWORD = 'one123456789';
    const NEW_PASSWORD = 'one987654321';

    this.render(hbs `{{user-credentials-form changingPassword=true}}`);

    let form = new UserCredentialsFormHelper(this.$());

    form.getInput('verify-currentPassword').val(OLD_PASSWORD).change();
    form.getInput('change-newPassword').val(NEW_PASSWORD).change();
    form.getInput('change-newPasswordRetype').val(NEW_PASSWORD + 'x').change();

    wait().then(() => {
      expect(this.$('button[type=submit]')).to.have.attr('disabled');
      done();
    });
  });
});
