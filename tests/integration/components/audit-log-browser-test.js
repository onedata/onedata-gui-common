import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find, findAll } from '@ember/test-helpers';

describe('Integration | Component | audit log browser', function () {
  setupRenderingTest();

  it('has class "audit-log-browser"', async function () {
    await render(hbs`{{audit-log-browser}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('audit-log-browser');
  });

  it('shows timestamp column header', async function () {
    await render(hbs`{{audit-log-browser}}`);

    const columnHeader = find('.timestamp-column-header');
    expect(columnHeader).to.have.trimmed.text('Time');
  });

  it('does not show severity column header by default', async function () {
    await render(hbs`{{audit-log-browser}}`);

    const columnHeader = find('.severity-column-header');
    expect(columnHeader).to.not.exist;
  });

  it('shows severity column header when "isSeverityColumnVisible" is true', async function () {
    await render(hbs`{{audit-log-browser isSeverityColumnVisible=true}}`);

    const columnHeader = find('.severity-column-header');
    expect(columnHeader).to.have.trimmed.text('Severity');
  });

  it('shows only timestamp column header when no custom column headers are defined', async function () {
    await render(hbs`{{audit-log-browser}}`);

    const columnHeaders = findAll('.audit-log-table-column-header');
    expect(columnHeaders).to.have.length(1);
    expect(columnHeaders[0]).to.have.class('timestamp-column-header');
  });

  it('shows custom column headers', async function () {
    const customColumnHeaders = this.set('customColumnHeaders', [{
      classNames: 'col1',
      content: 'Col 1',
    }, {
      classNames: 'col2',
      content: 'Col 2',
    }]);
    await render(hbs`{{audit-log-browser
      customColumnHeaders=customColumnHeaders
    }}`);

    const columnHeaders = findAll('.audit-log-table-column-header');
    expect(columnHeaders).to.have.length(1 + customColumnHeaders.length);
    columnHeaders.slice(1).forEach((columnHeader, idx) => {
      expect(columnHeader).to.have.class(customColumnHeaders[idx].classNames);
      expect(columnHeader).to.have.trimmed.text(customColumnHeaders[idx].content);
    });
  });

  it('shows information about no entries when no "onFetchEntries" was passed', async function () {
    await render(hbs`{{audit-log-browser}}`);

    const emptyRow = find('.table-is-empty-row');
    expect(emptyRow).to.exist;
    expect(emptyRow).to.have.trimmed.text('No log entries.');
  });

  it('shows custom information about no entries when "noLogEntriesText" is set', async function () {
    await render(hbs`{{audit-log-browser noLogEntriesText="some text"}}`);

    expect(find('.table-is-empty-row')).to.have.trimmed.text('some text');
  });
});
