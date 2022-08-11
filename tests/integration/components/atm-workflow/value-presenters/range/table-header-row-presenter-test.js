import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, findAll } from '@ember/test-helpers';

describe('Integration | Component | atm workflow/value presenters/range/table header row presenter', function () {
  setupRenderingTest();

  it('has classes "table-header-row-presenter" and "range-table-header-row-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/range/table-header-row-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('table-header-row-presenter')
      .and.to.have.class('range-table-header-row-presenter');
  });

  it('shows three column headers - start, end and step', async function () {
    await render(hbs`{{atm-workflow/value-presenters/range/table-header-row-presenter}}`);

    const ths = findAll('.table-header-row-presenter th');
    expect(ths).to.have.length(3);
    expect(ths[0]).to.have.class('column-start')
      .and.to.have.trimmed.text('Start');
    expect(ths[1]).to.have.class('column-end')
      .and.to.have.trimmed.text('End');
    expect(ths[2]).to.have.class('column-step')
      .and.to.have.trimmed.text('Step');
  });
});
