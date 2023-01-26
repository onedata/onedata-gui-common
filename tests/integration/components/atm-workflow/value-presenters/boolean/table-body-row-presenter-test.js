import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, findAll } from '@ember/test-helpers';

describe('Integration | Component | atm workflow/value presenters/boolean/table body row presenter', function () {
  setupRenderingTest();

  it('has classes "table-body-row-presenter" and "boolean-table-body-row-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/boolean/table-body-row-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('table-body-row-presenter')
      .and.to.have.class('boolean-table-body-row-presenter');
  });

  it('shows single column - value', async function () {
    await render(hbs`{{atm-workflow/value-presenters/boolean/table-body-row-presenter
      value=true
    }}`);

    const tds = findAll('.table-body-row-presenter td');
    expect(tds).to.have.length(1);
    expect(tds[0]).to.have.class('column-value')
      .and.to.have.trimmed.text('true')
      .and.to.contain('.boolean-single-line-presenter');
  });
});
