import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';

describe('Integration | Component | atm-workflow/value-presenters/group/single-line-presenter', function () {
  setupRenderingTest();

  it('has classes "single-line-presenter" and "group-single-line-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/group/single-line-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('single-line-presenter')
      .and.to.have.class('group-single-line-presenter');
  });

  it('presents passed value as a group', async function () {
    this.set('value', { name: 'group1' });
    await render(hbs`{{atm-workflow/value-presenters/group/single-line-presenter
      value=value
    }}`);

    expect(find('.single-line-presenter')).to.have.trimmed.text('[Group "group1"]');
  });
});
