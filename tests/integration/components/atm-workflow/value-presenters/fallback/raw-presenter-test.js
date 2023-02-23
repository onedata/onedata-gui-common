import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import { replaceEmberAceWithTextarea } from '../../../../../helpers/ember-ace';

describe('Integration | Component | atm-workflow/value-presenters/fallback/raw-presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
  });

  it('has classes "raw-presenter" and "fallback-raw-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/fallback/raw-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('raw-presenter')
      .and.to.have.class('fallback-raw-presenter');
  });

  it('presents passed value', async function () {
    this.set('value', [{ a: 1 }, 3]);
    await render(hbs`{{atm-workflow/value-presenters/fallback/raw-presenter
      value=value
    }}`);

    const expectedValue = `[
  {
    "a": 1
  },
  3
]`;
    expect(find('.raw-presenter textarea')).to.have.value(expectedValue);
  });
});
