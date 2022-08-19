import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';

describe('Integration | Component | atm workflow/value presenters/range/single line presenter', function () {
  setupRenderingTest();

  it('has classes "single-line-presenter" and "range-single-line-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/range/single-line-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('single-line-presenter')
      .and.to.have.class('range-single-line-presenter');
  });

  it('presents passed value as a range', async function () {
    this.set('value', { start: 2, end: 10, step: 3 });
    await render(hbs`{{atm-workflow/value-presenters/range/single-line-presenter
      value=value
    }}`);

    expect(find('.single-line-presenter')).to.have.trimmed.text('[Range 2:10:3]');
  });
});
