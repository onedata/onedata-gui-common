import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import { replaceEmberAceWithTextarea } from '../../../../../helpers/ember-ace';

describe('Integration | Component | atm-workflow/value-presenters/group/raw-presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
  });

  it('has classes "raw-presenter" and "group-raw-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/group/raw-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('raw-presenter')
      .and.to.have.class('group-raw-presenter');
  });

  it('presents passed value', async function () {
    this.set('value', { groupId: 'abc', name: 'group1' });
    await render(hbs`{{atm-workflow/value-presenters/group/raw-presenter
      value=value
    }}`);

    const expectedValue = `{
  "groupId": "abc",
  "name": "group1"
}`;
    expect(find('.raw-presenter textarea')).to.have.value(expectedValue);
  });
});
