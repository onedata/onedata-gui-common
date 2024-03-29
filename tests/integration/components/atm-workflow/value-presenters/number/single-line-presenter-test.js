import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';

describe('Integration | Component | atm-workflow/value-presenters/number/single-line-presenter', function () {
  setupRenderingTest();

  it('has classes "single-line-presenter" and "number-single-line-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/number/single-line-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('single-line-presenter')
      .and.to.have.class('number-single-line-presenter');
  });

  it('presents passed value as a number', async function () {
    await render(hbs`{{atm-workflow/value-presenters/number/single-line-presenter
      value=123
    }}`);

    expect(find('.single-line-presenter')).to.have.trimmed.text('123');
  });
});
