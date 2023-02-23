import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, findAll } from '@ember/test-helpers';

describe('Integration | Component | atm-workflow/value-presenters/object/table-header-row-presenter', function () {
  setupRenderingTest();

  it('has classes "table-header-row-presenter" and "object-table-header-row-presenter"',
    async function () {
      await render(hbs`{{atm-workflow/value-presenters/object/table-header-row-presenter}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class('table-header-row-presenter')
        .and.to.have.class('object-table-header-row-presenter');
    }
  );

  it('shows single column header - value - when columns are not specified', async function () {
    await render(hbs`{{atm-workflow/value-presenters/object/table-header-row-presenter}}`);

    const ths = findAll('.table-header-row-presenter th');
    expect(ths).to.have.length(1);
    expect(ths[0]).to.have.class('column-value')
      .and.to.have.trimmed.text('Value');
  });

  it('shows single column header - value - when columns are an empty array', async function () {
    this.set('columns', []);
    await render(hbs`{{atm-workflow/value-presenters/object/table-header-row-presenter
      columns=columns
    }}`);

    const ths = findAll('.table-header-row-presenter th');
    expect(ths).to.have.length(1);
    expect(ths[0]).to.have.class('column-value')
      .and.to.have.trimmed.text('Value');
  });

  it('shows column headers based on non-empty columns array', async function () {
    const columns = this.set('columns', ['a', 'b', 'c']);
    await render(hbs`{{atm-workflow/value-presenters/object/table-header-row-presenter
      columns=columns
    }}`);

    const ths = findAll('.table-header-row-presenter th');
    expect(ths).to.have.length(3);
    columns.forEach((column, idx) =>
      expect(ths[idx]).to.have.class('column-object-property')
      .and.to.have.trimmed.text(column)
    );
  });
});
