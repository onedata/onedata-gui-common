import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find, findAll, settled, click } from '@ember/test-helpers';
// TODO: VFS-9129 use scrollTo helper from @ember/test-helpers after upgrading it to 2.0
import { scrollTo } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import OneTooltipHelper from '../../helpers/one-tooltip';

const latestEntryIndex = 1658324755;
const waitTimeForReload = 10;

describe('Integration | Component | infinite scroll table', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      onFetchEntries: sinon.spy(createFetchEntriesMock({
        getHangLoadingNext: () => this.get('hangLoadingNext'),
        getLatestEntryIndex: () => this.get('latestEntryIndex'),
      })),
      hangLoadingNext: false,
      latestEntryIndex,
      fakeClock: sinon.useFakeTimers({
        now: Date.now(),
        shouldAdvanceTime: true,
      }),
    });
  });

  afterEach(function () {
    this.get('fakeClock').restore();
  });

  it('has class "infinite-scroll-table"', async function () {
    await render(hbs`{{infinite-scroll-table}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('infinite-scroll-table');
  });

  it('shows thead section content', async function () {
    await render(hbs`
      {{#infinite-scroll-table as |section|}}
        {{#if (eq section.sectionName "tableHead")}}
          <tr><th class="my-th"></th></tr>
        {{/if}}
      {{/infinite-scroll-table}}
    `);

    expect(find('thead .my-th')).to.exist;
    expect(findAll('.my-th')).to.have.length(1);
  });

  it('shows information about no entries when no "onFetchEntries" was passed', async function () {
    await render(hbs`{{infinite-scroll-table}}`);

    const emptyRow = find('.table-is-empty-row');
    expect(emptyRow).to.exist;
    expect(emptyRow).to.have.trimmed.text('No entries.');
  });

  it('shows custom information about no entries when "noEntriesText" is set', async function () {
    await render(hbs`{{infinite-scroll-table noEntriesText="some text"}}`);

    expect(find('.table-is-empty-row')).to.have.trimmed.text('some text');
  });

  it('shows fetched entries', async function () {
    await render(hbs`<div style="display: grid; height: 10em;">
      {{#infinite-scroll-table onFetchEntries=onFetchEntries as |section|}}
        {{#if (eq section.sectionName "entryRow")}}
          <tr class={{section.rowClasses}} data-row-id={{section.dataRowId}}>
            <td class="my-td">{{section.entry.index}}</td>
          </tr>
        {{/if}}
      {{/infinite-scroll-table}}
    </div>`);

    const rows = findAll('.table-entry');
    expect(rows).to.have.lengthOf.above(1);

    expect(rows[0].getAttribute('data-row-id'))
      .to.equal(String(latestEntryIndex));
    expect(rows[0].querySelector('.my-td'))
      .to.have.trimmed.text(String(latestEntryIndex));
    expect(rows[1].getAttribute('data-row-id'))
      .to.equal(String(latestEntryIndex - 1));
    expect(rows[1].querySelector('.my-td'))
      .to.have.trimmed.text(String(latestEntryIndex - 1));
  });

  it('shows spinner during initial load', async function () {
    this.set('onFetchEntries', () => new Promise(() => {}));
    await render(hbs`<div style="display: grid; height: 10em;">
      {{#infinite-scroll-table onFetchEntries=onFetchEntries as |section|}}
        {{#if (eq section.sectionName "entryRow")}}
          <tr class={{section.rowClasses}} data-row-id={{section.dataRowId}}></tr>
        {{/if}}
      {{/infinite-scroll-table}}
    </div>`);

    expect(findAll('.loading-row .spinner')).to.have.length(1);
    expect(find('.table-entry')).to.not.exist;
  });

  it('does not show any spinner when entries are loaded', async function () {
    await render(hbs`<div style="display: grid; height: 10em;">
      {{#infinite-scroll-table onFetchEntries=onFetchEntries as |section|}}
        {{#if (eq section.sectionName "entryRow")}}
          <tr class={{section.rowClasses}} data-row-id={{section.dataRowId}}><td></td></tr>
        {{/if}}
      {{/infinite-scroll-table}}
    </div>`);

    expect(find('.loading-row .spinner')).to.not.exist;
  });

  it('shows bottom spinner when next entries are being loaded', async function () {
    await render(hbs`<div style="display: grid; height: 10em;">
      {{#infinite-scroll-table onFetchEntries=onFetchEntries as |section|}}
        {{#if (eq section.sectionName "entryRow")}}
          <tr class={{section.rowClasses}} data-row-id={{section.dataRowId}}><td></td></tr>
        {{/if}}
      {{/infinite-scroll-table}}
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
    const onFetchEntries = this.get('onFetchEntries');

    await render(hbs`<div style="display: grid; height: 10em;">
      {{#infinite-scroll-table onFetchEntries=onFetchEntries as |section|}}
        {{#if (eq section.sectionName "entryRow")}}
          <tr class={{section.rowClasses}} data-row-id={{section.dataRowId}}>
            <td>{{section.entry.index}}</td>
          </tr>
        {{/if}}
      {{/infinite-scroll-table}}
    </div>`);

    onFetchEntries.resetHistory();
    await waitForPossibleReload(this);
    expect(onFetchEntries).to.be.called;
    expect(find('.table-entry')).to.have.trimmed.text(String(latestEntryIndex + 1));
  });

  it('does not update entries when table is not at the top', async function () {
    const onFetchEntries = this.get('onFetchEntries');

    await render(hbs`<div style="display: grid; height: 10em;">
      {{#infinite-scroll-table onFetchEntries=onFetchEntries as |section|}}
        {{#if (eq section.sectionName "entryRow")}}
          <tr class={{section.rowClasses}} data-row-id={{section.dataRowId}}><td></td></tr>
        {{/if}}
      {{/infinite-scroll-table}}
    </div>`);

    await scrollTo('.table-scrollable-container', 0, 10000);
    await settled();
    onFetchEntries.resetHistory();
    await waitForPossibleReload(this);
    expect(onFetchEntries).to.not.be.called;
  });

  it('updates entries when table is scrolled down and then scrolled back to the top', async function () {
    const onFetchEntries = this.get('onFetchEntries');

    await render(hbs`<div style="display: grid; height: 10em;">
      {{#infinite-scroll-table onFetchEntries=onFetchEntries as |section|}}
        {{#if (eq section.sectionName "entryRow")}}
          <tr class={{section.rowClasses}} data-row-id={{section.dataRowId}}>
            <td>{{section.entry.index}}</td>
          </tr>
        {{/if}}
      {{/infinite-scroll-table}}
    </div>`);

    await scrollTo('.table-scrollable-container', 0, 10000);
    await settled();
    await scrollTo('.table-scrollable-container', 0, 0);
    await settled();
    onFetchEntries.resetHistory();
    await waitForPossibleReload(this);
    expect(onFetchEntries).to.be.called;
    expect(find('.table-entry'))
      .to.have.trimmed.text(String(latestEntryIndex + 1));
  });

  it('does not render table title when "title" is not set', async function () {
    await render(hbs`{{infinite-scroll-table}}`);

    expect(find('.table-title')).to.not.exist;
  });

  it('renders table title when "title" is set', async function () {
    await render(hbs`{{infinite-scroll-table title="some title"}}`);

    expect(find('.table-title')).to.have.trimmed.text('some title');
  });

  it('does not render table title tip when "titleTip" is not set', async function () {
    await render(hbs`{{infinite-scroll-table title="test"}}`);

    expect(find('.table-title .title-tip')).to.not.exist;
  });

  it('renders table title tip when "titleTip" is set', async function () {
    await render(hbs`{{infinite-scroll-table title="test" titleTip="some tip"}}`);

    const tipContent = await new OneTooltipHelper(
      '.table-title .title-tip .one-icon'
    ).getText();
    expect(tipContent).to.equal('some tip');
  });

  it('adds custom classes to the table title tip when "titleTipClassNames" is set', async function () {
    await render(hbs`{{infinite-scroll-table
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
      await render(hbs`<div style="display: grid; height: 10em;">
        {{#infinite-scroll-table onFetchEntries=onFetchEntries as |section|}}
          {{#if (eq section.sectionName "entryRow")}}
            <tr class={{section.rowClasses}} data-row-id={{section.dataRowId}}><td></td></tr>
          {{/if}}
        {{/infinite-scroll-table}}
      </div>`);

      expect(find('.table-entry.clickable')).to.not.exist;
      await click('.table-entry');
      expectDetailsToBeHidden();
    }
  );

  it('adds "clickable" class to entries and shows details on entry click when "doesOpenDetailsOnClick" is true',
    async function () {
      await render(hbs`<div style="display: grid; height: 10em;">
        {{#infinite-scroll-table
          onFetchEntries=onFetchEntries
          doesOpenDetailsOnClick=true
          as |section|
        }}
          {{#if (eq section.sectionName "entryRow")}}
            <tr
              class={{section.rowClasses}}
              data-row-id={{section.dataRowId}}
              onclick={{section.onRowClick}}
            ><td></td></tr>
          {{else if (eq section.sectionName "entryDetails")}}
            <span class="my-span">{{section.entry.index}}</span>
          {{/if}}
        {{/infinite-scroll-table}}
      </div>`);

      const firstEntry = find('.table-entry');
      expect(find('.table-entry.clickable')).to.exist;
      await click(firstEntry);
      expectDetailsToBeVisible();
      expect(firstEntry).to.have.class('selected');
      expect(find('.details-container .my-span'))
        .to.have.trimmed.text(String(latestEntryIndex));
    }
  );

  [{
    triggerDescription: '"hide" bar',
    trigger: '.close-details',
  }, {
    triggerDescription: 'table column header',
    trigger: '.my-th',
  }, {
    triggerDescription: 'table title',
    trigger: '.table-title',
  }].forEach(({ triggerDescription, trigger }) => {
    it(`hides details on ${triggerDescription} click`, async function () {
      await render(hbs`<div style="display: grid; height: 10em;">
        {{#infinite-scroll-table
          title="my title"
          onFetchEntries=onFetchEntries
          doesOpenDetailsOnClick=true
          as |section|
        }}
          {{#if (eq section.sectionName "tableHead")}}
            <tr><th class="my-th"></th></tr>
          {{else if (eq section.sectionName "entryRow")}}
            <tr
              class={{section.rowClasses}}
              data-row-id={{section.dataRowId}}
              onclick={{section.onRowClick}}
            ><td></td></tr>
          {{/if}}
        {{/infinite-scroll-table}}
      </div>`);

      await click('.table-entry');
      await click(trigger);

      expectDetailsToBeHidden();
    });
  });

  it('changes visible details when user clicks on another entry', async function () {
    await render(hbs`<div style="display: grid; height: 10em;">
      {{#infinite-scroll-table
        onFetchEntries=onFetchEntries
        doesOpenDetailsOnClick=true
        as |section|
      }}
        {{#if (eq section.sectionName "entryRow")}}
          <tr
            class={{section.rowClasses}}
            data-row-id={{section.dataRowId}}
            onclick={{section.onRowClick}}
          ><td></td></tr>
        {{else if (eq section.sectionName "entryDetails")}}
          <span class="my-span">{{section.entry.index}}</span>
        {{/if}}
      {{/infinite-scroll-table}}
    </div>`);

    const entries = findAll('.table-entry');
    await click(entries[0]);
    await click(entries[1]);

    expectDetailsToBeVisible();
    expect(find('.details-container .my-span')).to.have.trimmed.text(
      String(latestEntryIndex - 1)
    );
  });
});

function createFetchEntriesMock({ getHangLoadingNext, getLatestEntryIndex }) {
  return async function fetchEntriesMock(listingParams) {
    if (getHangLoadingNext?.() && listingParams?.offset > 0) {
      return new Promise(() => {});
    }

    let startIndex = typeof listingParams.index === 'string' ?
      Number(listingParams.index) : getLatestEntryIndex();
    if (typeof listingParams.offset === 'number') {
      startIndex -= listingParams.offset;
    }

    const entries = [];
    for (let i = 0; i < listingParams.limit; i++) {
      const entryIndex = startIndex - i;
      if (entryIndex > getLatestEntryIndex()) {
        continue;
      }
      entries.push(generateEntryForTimestamp(entryIndex));
    }

    return {
      entries,
      isLast: false,
    };
  };
}

function generateEntryForTimestamp(index) {
  return {
    index: String(index),
    field1: 'field 1',
    field2: `field 2 ${index}`,
  };
}

async function waitForPossibleReload(testCase) {
  const {
    fakeClock,
    latestEntryIndex,
  } = testCase.getProperties('fakeClock', 'latestEntryIndex');

  testCase.set(
    'latestEntryIndex',
    latestEntryIndex + 1
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
  expect(find('.table-entry.selected')).to.not.exist;
}

function expectDetailsToBeVisible() {
  expect(find('.details-container')).to.have.class('visible');
  expect(find('.infinite-scroll-table')).to.have.class('shows-details');
  expect(findAll('.table-entry.selected')).to.have.length(1);
}
