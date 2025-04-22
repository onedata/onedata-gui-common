import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, findAll } from '@ember/test-helpers';

describe('Integration | Component | atm-workflow/value-presenters/group/table-header-row-presenter', function () {
  setupRenderingTest();

  it('has classes "table-header-row-presenter" and "group-table-header-row-presenter"',
    async function () {
      await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableHeaderRowPresenter />`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class('table-header-row-presenter')
        .and.to.have.class('group-table-header-row-presenter');
    }
  );

  it('shows two column headers - name and type', async function () {
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableHeaderRowPresenter />`);

    const ths = findAll('.table-header-row-presenter th');
    expect(ths).to.have.length(2);
    expect(ths[0]).to.have.class('column-name')
      .and.to.have.trimmed.text('Groups');
    expect(ths[1]).to.have.class('column-type')
      .and.to.have.trimmed.text('Type');
  });
});
