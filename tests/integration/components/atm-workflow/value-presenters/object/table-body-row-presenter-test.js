import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, findAll } from '@ember/test-helpers';

describe('Integration | Component | atm workflow/value presenters/object/table body row presenter', function () {
  setupRenderingTest();

  it('has classes "table-body-row-presenter" and "object-table-body-row-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/object/table-body-row-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('table-body-row-presenter')
      .and.to.have.class('object-table-body-row-presenter');
  });

  it('shows single column - value - when columns are not specified', async function () {
    this.set('value', { a: 1 });
    await render(hbs`{{atm-workflow/value-presenters/object/table-body-row-presenter
      value=value
    }}`);

    const tds = findAll('.table-body-row-presenter td');
    expect(tds).to.have.length(1);
    expect(tds[0]).to.have.class('column-value')
      .and.to.have.trimmed.text('{"a":1}')
      .and.to.contain('.object-single-line-presenter');
  });

  it('shows single column - value - when columns are an empty array', async function () {
    this.setProperties({
      columns: [],
      value: { a: 1 },
    });
    await render(hbs`{{atm-workflow/value-presenters/object/table-body-row-presenter
      columns=columns
      value=value
    }}`);

    const tds = findAll('.table-body-row-presenter td');
    expect(tds).to.have.length(1);
    expect(tds[0]).to.have.class('column-value')
      .and.to.have.trimmed.text('{"a":1}')
      .and.to.contain('.object-single-line-presenter');
  });

  it('shows columns based on non-empty columns array', async function () {
    this.setProperties({
      columns: ['a', 'b', 'c'],
      value: { a: 1, b: null },
    });
    await render(hbs`{{atm-workflow/value-presenters/object/table-body-row-presenter
      columns=columns
      value=value
    }}`);

    const tds = findAll('.table-body-row-presenter td');
    expect(tds).to.have.length(3);
    expect(tds[0]).to.have.class('column-object-property')
      .and.to.have.trimmed.text('1');
    expect(tds[1]).to.have.class('column-object-property')
      .and.to.have.trimmed.text('null');
    expect(tds[2]).to.have.class('column-object-property')
      .and.to.have.trimmed.text('–');
  });
});
