/**
 * Renders a table with infinite scroll ability (dynamic number of rows).
 *
 * Functionality:
 * - allows to show table title with tip,
 * - automatically handles infinite scroll elements (shadows, spinners etc.),
 * - allows to show entry details on row entry click. Details are shown in a
 *   small sliding window.
 * - has fully customizable content via yielded sections - allows to set custom
 *   table head, each row and details window content.
 *
 * # YIELDED SECTIONS
 *
 * Content of the table can (and has to be) customized via "yielded sections".
 * This components yields an object (called "section") which is different depending
 * on a location where the content will be placed:
 * - when `section.sectionName == 'tableHead'`, then content will be placed
 *   inside `thead` tag. It is a good place to render a row with `th` tags.
 * - when `section.sectionName == 'entryRow'`, then content will be used to render
 *   each entry. Here you have to place `tr` tag with appropriate `td`s inside.
 *   This section contains other yielded props:
 *   - `section.entry` - current entry to show (fetched via `onFetchEntries`)
 *   - `section.rowClassName` - row class that must be assigned to your `tr` tag
 *     (infinite scroll depends on them),
 *   - `section.dataRowId` - `data-row-id` attribute value for your `tr` tag
 *     that also must be assigned (like above, it is for infinite scroll),
 *   - `section.onRowClick` - click handler for your `tr` tag. If you want to
 *     see details window for your entries on click, you have to use it.
 *   Minimal example (where every shown `tr` tag attribute is required) is below:
 *   ```
 *   <tr class={{section.rowClassName}} data-row-id={{section.dataRowId}}>
 *     // your cells goes here...
 *   </tr>
 *   ```
 * - when `section.sectionName == 'entryDetails'`, then content will be placed
 *   inside details window, which is visible on entry row click
 *   (only when `doesOpenDetailsOnClick == true`).
 *   This section has `section.entry` property which contains currently selected
 *   (clicked) entry.
 *
 * Only `tableHead` and `entryRow` are required sections and should be defined.
 * `entryDetails` is optional and should be provided only when you want to show
 * details on entry click.
 *
 * # HOW TO USE
 *
 * Typical usage of this component starts with defining it's hbs invocation:
 * ```
 * {{#infinite-scroll-table
 *   onFetchEntries=fetchEntriesCallback
 *   columnsCount=2
 *   title=(tt this "tableTitle")
 *   titleTip=(tt this "tableTitleTip")
 *   doesOpenDetailsOnClick=true
 *   as |section|
 * }}
 *   {{#if (eq section.sectionName "tableHead")}}
 *     <tr>
 *       <th>Column 1 header</th>
 *       <th>Column 2 header</th>
 *     </tr>
 *   {{else if (eq section.sectionName "entryRow")}}
 *     <tr
 *       class={{section.rowClassName}}
 *       data-row-id={{section.dataRowId}}
 *       onclick={{section.onRowClick}}
 *     >
 *       <td>{{section.entry.prop1}}</td>
 *       <td>{{section.entry.prop2}}</td>
 *     </tr>
 *   {{else if (eq section.sectionName "entryDetails")}}
 *     <p>{{section.entry.details}}</p>
 *   {{/if}}
 * {{/infinite-scroll-table}}
 * ```
 *
 * Only `onFetchEntries` and `columnsCount` are required component arguments.
 * The rest of them (with `@virtual` annotations) is fully optional.
 * Also `entryDetails` section is optional and needed only when you want to
 * show additional details on entry row click.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} InfiniteScrollListingParams
 * @property {string|null} [index] an anchor where the listing should start.
 *   Every entry received from the backend has that field so it is ease to start
 *   from the specific entry.
 * @property {number} [limit] how many entries should be fetched.
 * @property {number} [offset] says where the listing should start relative to
 *   the provided `index`. Default is 0 which means that the specified entry
 *   will be the first one in the results. When negative integer is provided,
 *   the listing will start before specified entry. When it is a positive
 *   integer, it will omit that number of entries during the listing.
 */

/**
 * @typedef {Object} InfiniteScrollEntriesPage
 * @property {Array<InfiniteScrollEntry>} entries
 * @property {boolean} isLast
 */

/**
 * @typedef {Object} InfiniteScrollEntry
 * @property {string} index
 */

/**
 * @typedef {'onTop'|'always'|'never'} InfiniteScrollTableUpdateStrategy
 */

import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { inject as service } from '@ember/service';
import { not, and } from 'ember-awesome-macros';
import { schedule, next } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import layout from 'onedata-gui-common/templates/components/infinite-scroll-table';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';

export default Component.extend(I18n, {
  layout,
  classNames: ['infinite-scroll-table'],
  classNameBindings: ['selectedEntry:shows-details'],
  attributeBindings: ['style'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.infiniteScrollTable',

  /**
   * Should fetch entries page according to the passed parameters.
   * @virtual
   * @type {(listingParams: InfiniteScrollListingParams) => Promise<InfiniteScrollEntriesPage>}
   */
  onFetchEntries: undefined,

  /**
   * Exact number of columns must be provided for `colspan` attribute of
   * full-width cells (loading cells, "no entries"-cell etc.)
   * @virtual
   * @type {number}
   */
  columnsCount: undefined,

  /**
   * @virtual optional
   * @type {number}
   */
  rowHeight: 50,

  /**
   * A custom text visible when there are no entries to show. When not provided,
   * the default one will be used.
   * @virtual optional
   * @type {SafeString}
   */
  noEntriesText: undefined,

  /**
   * A custom tooltip visible when there are no entries to show, placed next to
   * the "no entries" text. When not provided, no tooltip will be shown.
   * @virtual optional
   * @type {SafeString}
   */
  noEntriesTip: undefined,

  /**
   * A text shown above the table and working as a title.
   * @virtual optional
   * @type {SafeString}
   */
  title: undefined,

  /**
   * A text shown inside table title's tooltip.
   * @virtual optional
   * @type {SafeString}
   */
  titleTip: undefined,

  /**
   * Additional class that should be added to the rendered title tooltip.
   * @virtual optional
   * @type {string}
   */
  titleTipClassName: undefined,

  /**
   * When true, opens details view on entry click.
   * @virtual optional
   * @type {boolean}
   */
  doesOpenDetailsOnClick: false,

  /**
   * @virtual optional
   * @type {InfiniteScrollTableUpdateStrategy}
   */
  updateStrategy: 'onTop',

  /**
   * @type {InfiniteScrollEntry|undefined}
   */
  selectedEntry: undefined,

  /**
   * True when the top of the table is visible on screen.
   * @type {boolean}
   */
  isTableTopVisible: true,

  /**
   * @type {Utils.InfiniteScroll}
   */
  infiniteScroll: undefined,

  /**
   * @type {Utils.ReplacingChunksArray}
   */
  entries: undefined,

  /**
   * @type {ResizeObserver|undefined}
   */
  resizeObserver: undefined,

  /**
   * Current limit of rendered entries. If is null, then there is no limit
   * and all entries are rendered. This property is used to optimize rendering
   * and to spread out heavy calculations over time. See more in
   * `increaseRenderedEntriesLimit()` method.
   * @type {number|null}
   */
  renderedEntriesLimit: 1,

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasNoEntries: and('entries.initialLoad.isSettled', not('entries.length')),

  /**
   * @type {ComputedProperty<string>}
   */
  style: computed('rowHeight', 'columnsCount', function style() {
    const variables = [
      `--infinite-scroll-table-row-height: ${this.rowHeight}px`,
      `--infinite-scroll-table-columns-count: ${this.columnsCount}`,
    ];
    return htmlSafe(variables.join('; '));
  }),

  onFetchEntriesObserver: observer(
    'onFetchEntries',
    async function onFetchEntriesObserver() {
      // Change of `onFetchEntries` is treated like a reset of infinite scroll
      // and possible replace of all entries.

      // Deselect currently selected entry (it probably wont be present anymore)
      this.toggleEntry(undefined);

      // Jump to the beginning of the list (which forces reload)
      await this.entries.scheduleJump(null);

      // Jump does not scroll directly to the beginning of the table. We have to
      // do it manually.
      schedule('afterRender', this, () => {
        window.requestAnimationFrame(() => {
          safeExec(this, () => {
            const scrollableContainer = this.getScrollableContainer();
            scrollableContainer?.scroll(0, 0);
          });
        });
      });
    }
  ),

  autoUpdateController: observer(
    'updateStrategy',
    'isTableTopVisible',
    function autoUpdateController() {
      const shouldBeUpdating = this.updateStrategy === 'always' ||
        (this.updateStrategy === 'onTop' && this.isTableTopVisible);
      const isAutoUpdating = this.infiniteScroll.isAutoUpdating;

      if (shouldBeUpdating && !isAutoUpdating) {
        this.infiniteScroll.startAutoUpdate(true);
      } else if (!shouldBeUpdating && isAutoUpdating) {
        this.infiniteScroll.stopAutoUpdate();
      }
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    const entries = ReplacingChunksArray.create({
      fetch: this.fetchEntries.bind(this),
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
    entries.on(
      'willChangeArrayBeginning',
      async ({ updatePromise, newItemsCount }) => {
        await updatePromise;
        safeExec(this, () => {
          this.adjustScrollAfterBeginningChange(newItemsCount);
        });
      }
    );

    const infiniteScroll = InfiniteScroll.create({
      entries,
      singleRowHeight: this.rowHeight,
      onScroll: this.handleTableScroll.bind(this),
    });

    this.setProperties({
      entries,
      infiniteScroll,
    });

    this.autoUpdateController();
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    this.infiniteScroll.mount(this.element.querySelector('.entries-table'));
    this.setupResizeObserver();

    this.entries.initialLoad.then(() =>
      next(() => this.increaseRenderedEntriesLimit())
    );
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.teardownResizeObserver();
      this.infiniteScroll.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * When entries array gets expanded on the beginning (items are unshifted into
   * array), we need to compensate scroll because new content is added on top.
   * Currently (as of 2021) not all browsers support scroll anchoring and
   * `perfect-scrollbar` has issues with it (anchoring is disabled), so we need to do
   * scroll correction manually.
   * @param {number} newItemsCount how many items have been added to the beginning
   *   of the list
   * @returns {void}
   */
  adjustScrollAfterBeginningChange(newEntriesCount = 0) {
    const topDiff = newEntriesCount * this.rowHeight;
    if (topDiff <= 0) {
      return;
    }

    schedule('afterRender', this, () => {
      window.requestAnimationFrame(() => {
        safeExec(this, () => {
          const scrollableContainer = this.getScrollableContainer();
          scrollableContainer?.scrollTo(
            null,
            scrollableContainer?.scrollTop + topDiff
          );
        });
      });
    });
  },

  /**
   * First rendering is very heavy due to dozens of components ready to render
   * at the same time. To mitigate freezeing GUI, first rendering is
   * divided and spread out in time. Instead of rendering all entries at once,
   * each entry is rendered one after another in consecutive `next()` calls
   * so the rendered list "grows" entry by entry.
   * This method is responsible for handling that mechanism.
   * @returns {void}
   */
  increaseRenderedEntriesLimit() {
    safeExec(this, () => {
      if (this.renderedEntriesLimit === null) {
        return;
      }

      let newRenderedEntriesLimit = this.renderedEntriesLimit + 1;

      if (newRenderedEntriesLimit < this.entries.length) {
        next(() => this.increaseRenderedEntriesLimit());
      } else if (newRenderedEntriesLimit >= this.entries.length) {
        newRenderedEntriesLimit = null;
      }

      this.getScrollableContainer().dispatchEvent(new Event('scroll'));
      this.set('renderedEntriesLimit', newRenderedEntriesLimit);
    });
  },

  /**
   * @param {{ headerVisible: boolean }} params
   * @returns {void}
   */
  handleTableScroll({ headerVisible }) {
    if (this.isTableTopVisible !== headerVisible) {
      this.set('isTableTopVisible', headerVisible);
    }
  },

  /**
   * @returns {Promise<{ array: Array<InfiniteScrollEntry & { id: string }>, isLast: boolean }>}
   */
  async fetchEntries(index, limit, offset) {
    const result = this.onFetchEntries ? await this.onFetchEntries({
      index,
      limit,
      offset,
    }) : {
      entries: [],
      isLast: true,
    };

    // Entries don't have id, which is required by replacing chunks array.
    // Solution: using entry index as id.
    const entries = result?.entries?.map((entry) =>
      Object.assign({}, entry, { id: entry.index })
    );
    return {
      array: entries || [],
      isLast: entries ? Boolean(result.isLast) : true,
    };
  },

  /**
   * Resize observer is responsible for triggering scroll events on each component
   * resize. Without this, the infinite scroll would not have the most current
   * information about visible entries after component resize.
   * @returns {void}
   */
  setupResizeObserver() {
    if (this.resizeObserver) {
      return;
    }

    const scrollableContainer = this.getScrollableContainer();
    // Check whether ResizeObserver API is available
    if (!ResizeObserver || !scrollableContainer) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      scrollableContainer.dispatchEvent(new Event('scroll'));
    });
    resizeObserver.observe(scrollableContainer);

    this.set('resizeObserver', resizeObserver);
  },

  /**
   * @returns {void}
   */
  teardownResizeObserver() {
    this.resizeObserver?.disconnect();
  },

  /**
   * @returns {HTMLDivElement|null}
   */
  getScrollableContainer() {
    return this.element?.querySelector('.table-scrollable-container') ?? null;
  },

  /**
   * @param {InfiniteScrollEntry|undefined} entry
   * @returns {void}
   */
  toggleEntry(entry) {
    if (!this.doesOpenDetailsOnClick) {
      return;
    }

    this.set(
      'selectedEntry',
      this.selectedEntry?.index === entry?.index ? undefined : entry
    );
  },

  actions: {
    /**
     * @param {MouseEvent} event
     * @returns {void}
     */
    mainContentClick(event) {
      // Deselect entry when click occurred outside of any entry row.
      if (!event.target.closest('.table-entry')) {
        this.toggleEntry(undefined);
      }
    },

    /**
     * @param {InfiniteScrollEntry} entry
     * @returns {void}
     */
    entryClick(entry, event) {
      // Select entry only when it was the main target for the click action
      // (e.g. was clicked directly, not as a result of nested link/button click).
      if (isDirectlyClicked(event, event.currentTarget)) {
        this.toggleEntry(entry);
      }
    },

    /**
     * @returns {void}
     */
    closeDetails() {
      this.toggleEntry(undefined);
    },
  },
});
