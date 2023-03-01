import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

describe('Integration | Component | record name', function () {
  setupRenderingTest();

  it('renders only name for user without username', async function () {
    const mockedUser = EmberObject.create({
      name: 'user_name',
    });
    this.set('user', mockedUser);

    await render(hbs `{{record-name record=user}}`);

    expect(find('.record-name')).to.have.trimmed.text('user_name');
  });

  it('renders name and username for user', async function () {
    const mockedUserWithUsername = EmberObject.create({
      name: 'user_name',
      username: 'username',
    });
    this.set('user', mockedUserWithUsername);

    await render(hbs `{{record-name record=user}}`);

    expect(find('.record-name-general')).to.have.trimmed.text('user_name');
    expect(find('.record-username')).to.have.trimmed.text('(username)');
  });
});
