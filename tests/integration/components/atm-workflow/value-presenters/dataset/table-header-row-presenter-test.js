import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, findAll } from '@ember/test-helpers';

describe('Integration | Component | atm-workflow/value-presenters/dataset/table-header-row-presenter', function () {
  setupRenderingTest();

  it('has classes "table-header-row-presenter" and "dataset-table-header-row-presenter"',
    async function () {
      await render(hbs`{{atm-workflow/value-presenters/dataset/table-header-row-presenter}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class('table-header-row-presenter')
        .and.to.have.class('dataset-table-header-row-presenter');
    }
  );

  it('shows two column headers - name and root file path', async function () {
    await render(hbs`{{atm-workflow/value-presenters/dataset/table-header-row-presenter}}`);

    const ths = findAll('.table-header-row-presenter th');
    expect(ths).to.have.length(2);
    expect(ths[0]).to.have.class('column-name')
      .and.to.have.trimmed.text('Datasets');
    expect(ths[1]).to.have.class('column-root-file-path')
      .and.to.have.trimmed.text('Root file path');
  });
});
