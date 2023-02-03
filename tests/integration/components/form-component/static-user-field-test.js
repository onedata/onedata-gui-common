import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import StaticUserField from 'onedata-gui-common/utils/form-component/static-user-field';
import { setProperties } from '@ember/object';

const defaultMockUser = Object.freeze({
  fullName: 'Joe Smith',
  username: 'joe',
  entityId: 'dummy_user_id',
});

describe('Integration | Component | form component/static user field', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', StaticUserField.create({ ownerSource: this.owner }));
  });

  it('has class "static-user-field"', async function () {
    await render(hbs `{{form-component/static-user-field field=field}}`);

    expect(find('.static-user-field')).to.exist;
  });

  it('renders only user icon and dash when user and field value are empty', async function () {
    await render(hbs `{{form-component/static-user-field field=field}}`);

    expect(this.element.querySelector('.oneicon-user')).to.exist;
    expect(this.element.textContent.trim()).to.equal('—');
  });

  it('renders user name from field.user property when field.value is empty', async function () {
    this.set('field.user', defaultMockUser);

    await render(hbs `{{form-component/static-user-field field=field}}`);

    expect(this.element.textContent.trim()).to.match(
      new RegExp(`${defaultMockUser.fullName}\\s+\\(${defaultMockUser.username}\\)`)
    );
  });

  it('renders text from field.value property when field.value and field.user are not empty', async function () {
    setProperties(this.get('field'), {
      user: defaultMockUser,
      value: { ...defaultMockUser, fullName: 'Other User', username: 'george' },
    });

    await render(hbs `{{form-component/static-user-field field=field}}`);

    expect(this.element.textContent.trim()).to.match(
      new RegExp('Other User\\s+\\(george\\)')
    );
  });
});
