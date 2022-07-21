import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find, findAll, settled } from '@ember/test-helpers';
// TODO: VFS-9129 use scrollTo helper from @ember/test-helpers after upgrading it to 2.0
import { scrollTo } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import { EntrySeverity, translateEntrySeverity } from 'onedata-gui-common/utils/audit-log';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';

const allSeverities = Object.values(EntrySeverity);
const severityIcons = {
  debug: 'browser-info',
  info: 'browser-info',
  notice: 'browser-info',
  warning: 'checkbox-filled-warning',
  alert: 'checkbox-filled-warning',
  error: 'checkbox-filled-x',
  critical: 'checkbox-filled-x',
  emergency: 'checkbox-filled-x',
};
const latestLogEntryTimestamp = 1658324755;
const waitTimeForReload = 10;

describe('Integration | Component | audit log browser', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      onFetchLogEntries: sinon.spy(createFetchEntriesMock({
        getHangLoadingNext: () => this.get('hangLoadingNext'),
        getLatestLogEntryTimestamp: () => this.get('latestLogEntryTimestamp'),
      })),
      hangLoadingNext: false,
      latestLogEntryTimestamp,
      fakeClock: sinon.useFakeTimers({
        now: Date.now(),
        shouldAdvanceTime: true,
      }),
    });
  });

  afterEach(function () {
    this.get('fakeClock').restore();
  });

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

  it('shows information about no entries when no "onFetchLogEntries" was passed', async function () {
    await render(hbs`{{audit-log-browser}}`);

    const emptyRow = find('.table-is-empty-row');
    expect(emptyRow).to.exist;
    expect(emptyRow).to.have.trimmed.text('No log entries.');
  });

  it('shows custom information about no entries when "noLogEntriesText" is set', async function () {
    await render(hbs`{{audit-log-browser noLogEntriesText="some text"}}`);

    expect(find('.table-is-empty-row')).to.have.trimmed.text('some text');
  });

  it('shows fetched log entries from newest to oldest', async function () {
    await render(hbs`{{audit-log-browser onFetchLogEntries=onFetchLogEntries}}`);

    const logRows = findAll('.audit-log-table-entry');
    expect(logRows).to.have.lengthOf.above(1);

    expect(logRows[0].getAttribute('data-row-id'))
      .to.equal(String(latestLogEntryTimestamp));
    expect(logRows[1].getAttribute('data-row-id'))
      .to.equal(String(latestLogEntryTimestamp - 1));
  });

  it('shows fetched log entries timestamps', async function () {
    await render(hbs`{{audit-log-browser onFetchLogEntries=onFetchLogEntries}}`);

    expect(find('.audit-log-table-entry .timestamp-cell'))
      .to.have.trimmed.text('20 Jul 2022 15:45:55.500');
  });

  it('shows fetched log entries timestamps without milliseconds when "isTimestampRoundedToSeconds" is true',
    async function () {
      await render(hbs`{{audit-log-browser
        onFetchLogEntries=onFetchLogEntries
        isTimestampRoundedToSeconds=true
      }}`);

      expect(find('.audit-log-table-entry .timestamp-cell'))
        .to.have.trimmed.text('20 Jul 2022 15:45:55');
    }
  );

  it('does not show severity for fetched log entries by default', async function () {
    await render(hbs`{{audit-log-browser onFetchLogEntries=onFetchLogEntries}}`);

    expect(find('.audit-log-table-entry .severity-cell')).to.not.exist;
  });

  it('shows severity for fetched log entries when "isSeverityColumnVisible" is true', async function () {
    await render(hbs`{{audit-log-browser
      onFetchLogEntries=onFetchLogEntries
      isSeverityColumnVisible=true
    }}`);

    const correctSeverity = generateSeverityForTimestamp(latestLogEntryTimestamp);
    expect(find('.audit-log-table-entry .severity-cell')).to.have.trimmed.text(
      String(translateEntrySeverity(lookupService(this, 'i18n'), correctSeverity))
    );
  });

  it('adds class to each rendered log entry based on severity', async function () {
    await render(hbs`{{audit-log-browser onFetchLogEntries=onFetchLogEntries}}`);

    const logRows = findAll('.audit-log-table-entry');

    expect(logRows[0]).to.have.class(
      `audit-log-severity-${generateSeverityForTimestamp(latestLogEntryTimestamp)}`
    );
    expect(logRows[1]).to.have.class(
      `audit-log-severity-${generateSeverityForTimestamp(latestLogEntryTimestamp - 1)}`
    );
  });

  it('shows icons for each possible entry severity', async function () {
    await render(hbs`{{audit-log-browser
      onFetchLogEntries=onFetchLogEntries
      isSeverityColumnVisible=true
    }}`);

    allSeverities.forEach((severity) => {
      expect(find(`.audit-log-severity-${severity}`))
        .to.contain(`.one-icon.oneicon-${severityIcons[severity]}`);
    });
  });

  it('shows only timestamp for fetched log entries when there are no custom columns', async function () {
    await render(hbs`{{audit-log-browser onFetchLogEntries=onFetchLogEntries}}`);

    expect(find('.audit-log-table-entry').querySelectorAll('td')).to.have.length(1);
  });

  it('shows custom columns for fetched log entries when there are custom columns defined', async function () {
    this.set('customColumnHeaders', [{
      content: 'Description',
    }]);
    await render(hbs`{{#audit-log-browser
      onFetchLogEntries=onFetchLogEntries
      customColumnHeaders=customColumnHeaders
      as |logEntry|
    }}
      <td class="description-cell">{{logEntry.content.description}}</td>
    {{/audit-log-browser}}`);

    expect(find('.audit-log-table-entry').querySelectorAll('td')).to.have.length(2);
    expect(find('.audit-log-table-entry .description-cell'))
      .to.contain.text('Description for ');
  });

  it('shows spinner during initial load', async function () {
    this.set('onFetchLogEntries', () => new Promise(() => {}));
    await render(hbs`{{audit-log-browser onFetchLogEntries=onFetchLogEntries}}`);

    expect(findAll('.loading-row .spinner')).to.have.length(1);
    expect(find('.audit-log-table-entry')).to.not.exist;
  });

  it('does not show any spinner when log entries are loaded', async function () {
    await render(hbs`{{audit-log-browser onFetchLogEntries=onFetchLogEntries}}`);

    expect(find('.loading-row .spinner')).to.not.exist;
  });

  it('shows bottom spinner when next log entries are being loaded', async function () {
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    this.set('hangLoadingNext', true);
    let loadingRow;
    for (let i = 0; i < 10; i++) {
      await scrollTo('.audit-log-scrollable-container', 0, 10000);
      await settled();
      loadingRow = find('.loading-row');
      if (loadingRow) {
        break;
      }
    }

    expect(loadingRow).to.exist;
    expect(loadingRow).to.equal(find('tbody tr:last-child'));
    expect(loadingRow.querySelector('.spinner')).to.exist;
  });

  it('updates entries when table is at the top', async function () {
    const onFetchLogEntries = this.get('onFetchLogEntries');

    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    onFetchLogEntries.resetHistory();
    await waitForPossibleReload(this);
    expect(onFetchLogEntries).to.be.called;
    expect(find('.audit-log-table-entry .timestamp-cell'))
      .to.have.trimmed.text('20 Jul 2022 15:45:56.500');
  });

  it('does not update entries when table is not at the top', async function () {
    const onFetchLogEntries = this.get('onFetchLogEntries');

    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    await scrollTo('.audit-log-scrollable-container', 0, 10000);
    await settled();
    onFetchLogEntries.resetHistory();
    await waitForPossibleReload(this);
    expect(onFetchLogEntries).to.not.be.called;
  });

  it('updates entries when table is scrolled down and the scrolled back to the top', async function () {
    const onFetchLogEntries = this.get('onFetchLogEntries');

    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    await scrollTo('.audit-log-scrollable-container', 0, 10000);
    await settled();
    await scrollTo('.audit-log-scrollable-container', 0, 0);
    await settled();
    onFetchLogEntries.resetHistory();
    await waitForPossibleReload(this);
    expect(onFetchLogEntries).to.be.called;
    expect(find('.audit-log-table-entry .timestamp-cell'))
      .to.have.trimmed.text('20 Jul 2022 15:45:56.500');
  });

  it('allows to add custom class names to entries via "onGetClassNamesForLogEntry"', async function () {
    this.set('onGetClassNamesForLogEntry', (logEntry) => `custom-${logEntry.severity}`);
    await render(hbs`{{audit-log-browser
      onFetchLogEntries=onFetchLogEntries
      onGetClassNamesForLogEntry=onGetClassNamesForLogEntry
    }}`);

    const logRows = findAll('.audit-log-table-entry');

    expect(logRows[0]).to.have.class(
      `custom-${generateSeverityForTimestamp(latestLogEntryTimestamp)}`
    );
    expect(logRows[1]).to.have.class(
      `custom-${generateSeverityForTimestamp(latestLogEntryTimestamp - 1)}`
    );
  });
});

function createFetchEntriesMock({ getHangLoadingNext, getLatestLogEntryTimestamp }) {
  return async function fetchEntriesMock(listingParams) {
    if (getHangLoadingNext?.() && listingParams?.offset > 0) {
      return new Promise(() => {});
    }

    let startTimestamp = typeof listingParams.index === 'string' ?
      Number(listingParams.index) : getLatestLogEntryTimestamp();
    if (typeof listingParams.offset === 'number') {
      startTimestamp -= listingParams.offset;
    }

    const entries = [];
    for (let i = 0; i < listingParams.limit; i++) {
      const entryTimestamp = startTimestamp - i;
      if (entryTimestamp > getLatestLogEntryTimestamp()) {
        continue;
      }
      entries.push({
        index: String(entryTimestamp),
        timestamp: entryTimestamp * 1000 + 500,
        source: 'system',
        severity: generateSeverityForTimestamp(entryTimestamp),
        content: {
          description: `Description for ${entryTimestamp}`,
        },
      });
    }

    return {
      logEntries: entries,
      isLast: false,
    };
  };
}

function generateSeverityForTimestamp(timestamp) {
  return allSeverities[timestamp % allSeverities.length];
}

async function waitForPossibleReload(testCase) {
  const {
    fakeClock,
    latestLogEntryTimestamp,
  } = testCase.getProperties('fakeClock', 'latestLogEntryTimestamp');

  testCase.set(
    'latestLogEntryTimestamp',
    latestLogEntryTimestamp + 1
  );
  fakeClock.tick(waitTimeForReload * 1000);
  await settled();
}
