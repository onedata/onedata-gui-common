import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find, findAll, settled, click } from '@ember/test-helpers';
// TODO: VFS-9129 use scrollTo helper from @ember/test-helpers after upgrading it to 2.0
import { scrollTo } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import { EntrySeverity, translateEntrySeverity } from 'onedata-gui-common/utils/audit-log';
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
const waitTimeForReload = 10;

describe('Integration | Component | audit log browser', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
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

  it('shows spinner during initial load', async function () {
    this.set('onFetchLogEntries', () => new Promise(() => {}));
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    expect(findAll('.loading-row .spinner')).to.have.length(1);
    expect(find('.audit-log-table-entry')).to.not.exist;
  });

  it('does not show any spinner when log entries are loaded', async function () {
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    expect(find('.loading-row .spinner')).to.not.exist;
  });

  it('shows bottom spinner when next log entries are being loaded', async function () {
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    this.set('hangLoadingNext', true);
    let loadingRow;
    for (let i = 0; i < 10; i++) {
      await scrollTo('.table-scrollable-container', 0, 10000);
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
      .to.have.trimmed.text(getEntryFormattedTimestamp(latestLogEntryTimestamp + 1));
  });

  it('does not update entries when table is not at the top', async function () {
    const onFetchLogEntries = this.get('onFetchLogEntries');

    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    await scrollTo('.table-scrollable-container', 0, 10000);
    await settled();
    onFetchLogEntries.resetHistory();
    await waitForPossibleReload(this);
    expect(onFetchLogEntries).to.not.be.called;
  });

  it('updates entries when table is scrolled down and then scrolled back to the top', async function () {
    const onFetchLogEntries = this.get('onFetchLogEntries');

    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
    </div>`);

    await scrollTo('.table-scrollable-container', 0, 10000);
    await settled();
    await scrollTo('.table-scrollable-container', 0, 0);
    await settled();
    onFetchLogEntries.resetHistory();
    await waitForPossibleReload(this);
    expect(onFetchLogEntries).to.be.called;
    expect(find('.audit-log-table-entry .timestamp-cell'))
      .to.have.trimmed.text(getEntryFormattedTimestamp(latestLogEntryTimestamp + 1));
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

  it('does not render table title when "title" is not set', async function () {
    await render(hbs`{{audit-log-browser}}`);

    expect(find('.table-title')).to.not.exist;
  });

  it('renders table title when "title" is set', async function () {
    await render(hbs`{{audit-log-browser title="some title"}}`);

    expect(find('.table-title')).to.have.trimmed.text('some title');
  });

  it('does not render table title tip when "titleTip" is not set', async function () {
    await render(hbs`{{audit-log-browser title="test"}}`);

    expect(find('.table-title .title-tip')).to.not.exist;
  });

  it('renders table title tip when "titleTip" is set', async function () {
    await render(hbs`{{audit-log-browser title="test" titleTip="some tip"}}`);

    const tipContent = await new OneTooltipHelper(
      '.table-title .title-tip .one-icon'
    ).getText();
    expect(tipContent).to.equal('some tip');
  });

  it('adds custom classes to the table title tip when "titleTipClassNames" is set', async function () {
    await render(hbs`{{audit-log-browser
      title="test"
      titleTip="some tip"
      titleTipClassNames="abc"
    }}`);

    const tooltipHelper = await new OneTooltipHelper(
      '.table-title .title-tip .one-icon'
    );
    await tooltipHelper.open();
    expect(tooltipHelper.getTooltip()).to.have.class('abc');
  });

  it('does not add "clickable" class to entries and does not react to user click when "doesOpenDetailsOnClick" is not set',
    async function () {
      await render(hbs`<div style="display: flex; height: 10em;">
        {{audit-log-browser onFetchLogEntries=onFetchLogEntries}}
      </div>`);

      expect(find('.audit-log-table-entry.clickable')).to.not.exist;
      await click('.audit-log-table-entry');
      expectDetailsToBeHidden();
    }
  );

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
      expectDetailsToBeVisible();
      expect(firstEntry).to.have.class('selected');
      expect(find('.details-container .timestamp')).to.have.trimmed.text(
        firstEntry.querySelector('.timestamp-cell').textContent.trim()
      );
      expect(find('.details-container .content textarea')).to.have.value(
        JSON.stringify(generateEntryForTimestamp(latestLogEntryTimestamp), null, 2)
      );
    }
  );

  [{
    triggerDescription: '"hide" bar',
    trigger: '.close-details',
  }, {
    triggerDescription: 'table column header',
    trigger: '.timestamp-column-header',
  }, {
    triggerDescription: 'table title',
    trigger: '.table-title',
  }].forEach(({ triggerDescription, trigger }) => {
    it(`hides details on ${triggerDescription} click`, async function () {
      await render(hbs`<div style="display: flex; height: 10em;">
        {{audit-log-browser
          onFetchLogEntries=onFetchLogEntries
          doesOpenDetailsOnClick=true
          title="some title"
        }}
      </div>`);

      await click('.audit-log-table-entry');
      await click(trigger);

      expectDetailsToBeHidden();
    });
  });

  it('changes visible details when user clicks on another entry', async function () {
    await render(hbs`<div style="display: flex; height: 10em;">
      {{audit-log-browser
        onFetchLogEntries=onFetchLogEntries
        doesOpenDetailsOnClick=true
      }}
    </div>`);

    const entries = findAll('.audit-log-table-entry');
    await click(entries[0]);
    await click(entries[1]);

    expectDetailsToBeVisible();
    expect(find('.details-container .timestamp')).to.have.trimmed.text(
      entries[1].querySelector('.timestamp-cell').textContent.trim()
    );
    expect(find('.details-container .content textarea')).to.have.value(
      JSON.stringify(generateEntryForTimestamp(latestLogEntryTimestamp - 1), null, 2)
    );
  });

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
      entries.push(generateEntryForTimestamp(entryTimestamp));
    }

    return {
      logEntries: entries,
      isLast: false,
    };
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

function expectDetailsToBeHidden() {
  const detailsContainer = find('.details-container');
  if (detailsContainer) {
    expect(detailsContainer).to.not.have.class('visible');
  }
  expect(find('.infinite-scroll-table')).to.not.have.class('shows-details');
  expect(find('.audit-log-table-entry.selected')).to.not.exist;
}

function expectDetailsToBeVisible() {
  expect(find('.details-container')).to.have.class('visible');
  expect(find('.infinite-scroll-table')).to.have.class('shows-details');
  expect(findAll('.audit-log-table-entry.selected')).to.have.length(1);
}
