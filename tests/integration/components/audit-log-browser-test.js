import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find, findAll, click } from '@ember/test-helpers';
import {
  EntrySeverity,
  translateEntrySeverity,
} from 'onedata-gui-common/utils/audit-log';
import { lookupService } from '../../helpers/stub-service';
import OneTooltipHelper from '../../helpers/one-tooltip';
import { replaceEmberAceWithTextarea } from '../../helpers/ember-ace';
import sinon from 'sinon';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';

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

describe('Integration | Component | audit log browser', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
    this.set('onFetchLogEntries', fetchEntriesMock);
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
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    const logRows = findAll('.audit-log-table-entry');
    expect(logRows).to.have.lengthOf.above(1);

    expect(logRows[0].getAttribute('data-row-id'))
      .to.equal(String(latestLogEntryTimestamp));
    expect(logRows[1].getAttribute('data-row-id'))
      .to.equal(String(latestLogEntryTimestamp - 1));
  });

  it('shows fetched log entries timestamps', async function () {
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    expect(find('.audit-log-table-entry .timestamp-cell'))
      .to.have.trimmed.text(getEntryFormattedTimestamp(latestLogEntryTimestamp));
  });

  it('shows fetched log entries timestamps without milliseconds when "isTimestampRoundedToSeconds" is true',
    async function () {
      await render(hbs`<div style="display: flex; height: 10em;">
        {{audit-log-browser
          onFetchLogEntries=onFetchLogEntries
          isTimestampRoundedToSeconds=true
        }}
      </div>`);

      expect(find('.audit-log-table-entry .timestamp-cell'))
        .to.have.trimmed.text(getEntryFormattedTimestamp(latestLogEntryTimestamp, false));
    }
  );

  it('does not show severity for fetched log entries by default', async function () {
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    expect(find('.audit-log-table-entry .severity-cell')).to.not.exist;
  });

  it('shows severity for fetched log entries when "isSeverityColumnVisible" is true', async function () {
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser
        onFetchLogEntries=onFetchLogEntries
        isSeverityColumnVisible=true
      }}
    </div>`);

    const correctSeverity = generateSeverityForTimestamp(latestLogEntryTimestamp);
    expect(find('.audit-log-table-entry .severity-cell')).to.have.trimmed.text(
      String(translateEntrySeverity(lookupService(this, 'i18n'), correctSeverity))
    );
  });

  it('adds class to each rendered log entry based on severity', async function () {
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    const logRows = findAll('.audit-log-table-entry');

    expect(logRows[0]).to.have.class(
      `audit-log-severity-${generateSeverityForTimestamp(latestLogEntryTimestamp)}`
    );
    expect(logRows[1]).to.have.class(
      `audit-log-severity-${generateSeverityForTimestamp(latestLogEntryTimestamp - 1)}`
    );
  });

  it('shows icons for each possible entry severity', async function () {
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser
        onFetchLogEntries=onFetchLogEntries
        isSeverityColumnVisible=true
      }}
    </div>`);

    allSeverities.forEach((severity) => {
      expect(find(`.audit-log-severity-${severity}`))
        .to.contain(`.one-icon.oneicon-${severityIcons[severity]}`);
    });
  });

  it('shows only timestamp for fetched log entries when there are no custom columns', async function () {
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    expect(find('.audit-log-table-entry').querySelectorAll('td')).to.have.length(1);
  });

  it('shows custom columns for fetched log entries when there are custom columns defined', async function () {
    this.set('customColumnHeaders', [{
      content: 'Description',
    }]);
    await render(hbs`<div style="display: flex; height: 10em;">
      {{#audit-log-browser
        onFetchLogEntries=onFetchLogEntries
        customColumnHeaders=customColumnHeaders
        as |logEntry|
      }}
        <td class="description-cell">{{logEntry.content.description}}</td>
      {{/audit-log-browser}}
    </div>`);

    expect(find('.audit-log-table-entry').querySelectorAll('td')).to.have.length(2);
    expect(find('.audit-log-table-entry .description-cell'))
      .to.contain.text('Description for ');
  });

  it('allows to add custom class names to entries via "onGetClassNamesForLogEntry"', async function () {
    this.set('onGetClassNamesForLogEntry', (logEntry) => `custom-${logEntry.severity}`);
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser
        onFetchLogEntries=onFetchLogEntries
        onGetClassNamesForLogEntry=onGetClassNamesForLogEntry
      }}
    </div>`);

    const logRows = findAll('.audit-log-table-entry');

    expect(logRows[0]).to.have.class(
      `custom-${generateSeverityForTimestamp(latestLogEntryTimestamp)}`
    );
    expect(logRows[1]).to.have.class(
      `custom-${generateSeverityForTimestamp(latestLogEntryTimestamp - 1)}`
    );
  });

  it('renders table title with tip', async function () {
    await render(hbs`{{audit-log-browser
      title="test"
      titleTip="some tip"
      titleTipClassName="abc"
    }}`);

    expect(find('.table-title')).to.have.trimmed.text('test');
    const tooltipHelper = await new OneTooltipHelper(
      '.table-title .title-tip .one-icon'
    );
    await tooltipHelper.open();
    expect(tooltipHelper.getTooltip()).to.have.class('abc');
    expect(await tooltipHelper.getText()).to.equal('some tip');
  });

  it('adds "clickable" class to entries and shows details on entry click when "doesOpenDetailsOnClick" is true',
    async function () {
      await render(hbs`<div style="display: flex; height: 10em;">
        {{audit-log-browser
          onFetchLogEntries=onFetchLogEntries
          doesOpenDetailsOnClick=true
        }}
      </div>`);

      const firstEntry = find('.audit-log-table-entry');
      expect(find('.audit-log-table-entry.clickable')).to.exist;
      await click(firstEntry);
      expect(find('.details-container')).to.have.class('visible');
      expect(find('.infinite-scroll-table')).to.have.class('shows-details');
      expect(firstEntry).to.have.class('selected');
      expect(find('.details-container .timestamp')).to.have.trimmed.text(
        firstEntry.querySelector('.timestamp-cell').textContent.trim()
      );
      expect(find('.details-container .content textarea')).to.have.value(
        JSON.stringify(generateEntryForTimestamp(latestLogEntryTimestamp), null, 2)
      );
    }
  );

  it('shows working copy link in details', async function () {
    const copyStub = sinon.stub(lookupService(this, 'global-clipboard'), 'copy');

    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser
        onFetchLogEntries=onFetchLogEntries
        doesOpenDetailsOnClick=true
      }}
    </div>`);

    await click('.audit-log-table-entry');
    const copyLink = find('.details-container .copy-link');

    expect(copyLink).to.exist;
    expect(copyLink).to.have.trimmed.text('Copy JSON');

    expect(copyStub).to.be.not.called;
    await click(copyLink);
    expect(copyStub).to.be.calledOnce.and.to.be.calledWith(
      JSON.stringify(generateEntryForTimestamp(latestLogEntryTimestamp), null, 2),
      sinon.match({ string: 'Entry JSON' })
    );
  });
});

async function fetchEntriesMock(listingParams) {
  let startTimestamp = typeof listingParams.index === 'string' ?
    Number(listingParams.index) : latestLogEntryTimestamp;
  if (typeof listingParams.offset === 'number') {
    startTimestamp -= listingParams.offset;
  }

  const entries = [];
  for (let i = 0; i < listingParams.limit; i++) {
    const entryTimestamp = startTimestamp - i;
    if (entryTimestamp > latestLogEntryTimestamp) {
      continue;
    }
    entries.push(generateEntryForTimestamp(entryTimestamp));
  }

  return {
    logEntries: entries,
    isLast: false,
  };
}

function generateEntryForTimestamp(timestamp) {
  return {
    index: String(timestamp),
    timestamp: timestamp * 1000 + 500,
    source: 'system',
    severity: generateSeverityForTimestamp(timestamp),
    content: {
      description: `Description for ${timestamp}`,
    },
  };
}

function generateSeverityForTimestamp(timestamp) {
  return allSeverities[timestamp % allSeverities.length];
}

function getEntryFormattedTimestamp(timestamp, showMillis = true) {
  return dateFormat([timestamp + 0.5], {
    format: showMillis ? 'detailedReport' : 'report',
  });
}
