import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';

describe('Integration | Component | atm-workflow/value-presenters/fallback/single-line-presenter', function () {
  setupRenderingTest();

  it('has classes "single-line-presenter" and "fallback-single-line-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/fallback/single-line-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('single-line-presenter')
      .and.to.have.class('fallback-single-line-presenter');
  });

  it('presents passed value as a stringified JSON', async function () {
    this.set('value', [{ a: 1 }, 3]);
    await render(hbs`{{atm-workflow/value-presenters/fallback/single-line-presenter
      value=value
    }}`);

    expect(find('.single-line-presenter')).to.have.trimmed.text('[{"a":1},3]');
  });
});
