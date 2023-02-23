import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, findAll } from '@ember/test-helpers';

describe('Integration | Component | atm-workflow/value-presenters/file/table-header-row-presenter', function () {
  setupRenderingTest();

  it('has classes "table-header-row-presenter" and "file-table-header-row-presenter"',
    async function () {
      await render(hbs`{{atm-workflow/value-presenters/file/table-header-row-presenter}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class('table-header-row-presenter')
        .and.to.have.class('file-table-header-row-presenter');
    }
  );

  it('shows three column headers - name, path and size', async function () {
    await render(hbs`{{atm-workflow/value-presenters/file/table-header-row-presenter}}`);

    const ths = findAll('.table-header-row-presenter th');
    expect(ths).to.have.length(3);
    expect(ths[0]).to.have.class('column-name')
      .and.to.have.trimmed.text('Files');
    expect(ths[1]).to.have.class('column-path')
      .and.to.have.trimmed.text('Path');
    expect(ths[2]).to.have.class('column-size')
      .and.to.have.trimmed.text('Size');
  });
});
