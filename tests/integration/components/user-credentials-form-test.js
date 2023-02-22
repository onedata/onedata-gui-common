import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import FormHelper from 'dummy/tests/helpers/form';

class UserCredentialsFormHelper extends FormHelper {
  constructor(template) {
    super(template, '.user-credentials-form');
  }
}

describe('Integration | Component | user credentials form', function () {
  setupRenderingTest();

  it('shows secret password field by default', async function () {
    await render(hbs `{{user-credentials-form}}`);

    const form = new UserCredentialsFormHelper(this.element);

    expect(form.getInput('static-secretPassword'), 'secret password field exists')
      .to.exist;
  });

  it(
    'shows old password, new password and retype new password fields in change password mode',
    async function () {
      await render(hbs `{{user-credentials-form changingPassword=true}}`);

      const form = new UserCredentialsFormHelper(this.element);

      expect(form.getInput('static-secretPassword'), 'secret pass field')
        .to.not.exist;
      expect(form.getInput('verify-currentPassword'), 'current password field')
        .to.exist;
      expect(form.getInput('change-newPassword'), 'new password field')
        .to.exist;
      expect(form.getInput('change-newPasswordRetype'), 'new pass retype field')
        .to.exist;
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

    const form = new UserCredentialsFormHelper(this.element);

    await fillIn(form.getInput('verify-currentPassword'), OLD_PASSWORD);
    await fillIn(form.getInput('change-newPassword'), NEW_PASSWORD);
    await fillIn(form.getInput('change-newPasswordRetype'), NEW_PASSWORD);

    await click('button[type=submit]');
    expect(submitted).to.be.true;
  });

  it('disabled submit button when new passwords do not match', async function () {
    const OLD_PASSWORD = 'one123456789';
    const NEW_PASSWORD = 'one987654321';

    await render(hbs `{{user-credentials-form changingPassword=true}}`);

    const form = new UserCredentialsFormHelper(this.element);

    await fillIn(form.getInput('verify-currentPassword'), OLD_PASSWORD);
    await fillIn(form.getInput('change-newPassword'), NEW_PASSWORD);
    await fillIn(form.getInput('change-newPasswordRetype'), NEW_PASSWORD + 'x');

    expect(find('button[type=submit]').disabled).to.be.true;
  });
});
