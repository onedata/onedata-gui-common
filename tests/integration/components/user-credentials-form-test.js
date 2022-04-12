import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import FormHelper from 'dummy/tests/helpers/form';
import $ from 'jquery';

class UserCredentialsFormHelper extends FormHelper {
  constructor($template) {
    super($template, '.user-credentials-form');
  }
}

describe('Integration | Component | user credentials form', function () {
  setupRenderingTest();

  it('shows secret password field by default', async function () {
    await render(hbs `{{user-credentials-form}}`);

    const form = new UserCredentialsFormHelper($(this.element));

    expect(form.getInput('static-secretPassword')[0], 'secret password field exists')
      .to.exist;
  });

  it(
    'shows old password, new password and retype new password fields in change password mode',
    async function (done) {
      await render(hbs `{{user-credentials-form changingPassword=true}}`);

      const form = new UserCredentialsFormHelper($(this.element));

      expect(form.getInput('static-secretPassword')[0], 'secret pass field')
        .to.not.exist;
      expect(form.getInput('verify-currentPassword')[0], 'current password field')
        .to.exist;
      expect(form.getInput('change-newPassword')[0], 'new password field')
        .to.exist;
      expect(form.getInput('change-newPasswordRetype')[0], 'new pass retype field')
        .to.exist;

      done();
    }
  );

  it('submits current and new password', async function () {
    const OLD_PASSWORD = 'one123456789';
    const NEW_PASSWORD = 'one987654321';

    let submitted = false;
    this.set('submit', function ({ currentPassword, newPassword }) {
      expect(currentPassword).to.be.equal(OLD_PASSWORD);
      expect(newPassword).to.be.equal(NEW_PASSWORD);
      submitted = true;
    });

    await render(hbs `
      {{user-credentials-form
        changingPassword=true
        submit=(action submit)
      }}
    `);

    const form = new UserCredentialsFormHelper($(this.element));

    await fillIn(form.getInput('verify-currentPassword')[0], OLD_PASSWORD);
    await fillIn(form.getInput('change-newPassword')[0], NEW_PASSWORD);
    await fillIn(form.getInput('change-newPasswordRetype')[0], NEW_PASSWORD);

    await click('button[type=submit]');
    expect(submitted).to.be.true;
  });

  it('disabled submit button when new passwords do not match', async function () {
    const OLD_PASSWORD = 'one123456789';
    const NEW_PASSWORD = 'one987654321';

    await render(hbs `{{user-credentials-form changingPassword=true}}`);

    const form = new UserCredentialsFormHelper($(this.element));

    await fillIn(form.getInput('verify-currentPassword')[0], OLD_PASSWORD);
    await fillIn(form.getInput('change-newPassword')[0], NEW_PASSWORD);
    await fillIn(form.getInput('change-newPasswordRetype')[0], NEW_PASSWORD + 'x');

    expect(find('button[type=submit]').disabled).to.be.true;
  });
});
