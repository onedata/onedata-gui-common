import Component from '@ember/component';
import { computed } from '@ember/object';
import { promise } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/range-presenter';

export default Component.extend({
  layout,
  classNames: ['range-presenter'],

  /**
   * @virtual
   * @type {Object}
   */
  store: undefined,

  /**
   * @virtual
   * @type {(browseOptions: AtmRangeStoreContentBrowseOptions) => Promise<AtmRangeStoreContentBrowseResult|null>}
   */
  getStoreContentCallback: undefined,

  /**
   * @type {string}
   */
  emptyStoreText: undefined,

  /**
   * @type {AtmDataSpec}
   */
  dataSpec: Object.freeze({
    type: 'range',
  }),

  /**
   * @type {ComputedProperty<AtmRange|null>}
   */
  valueProxy: promise.object(
    computed('getStoreContentCallback', async function valueProxy() {
      return this.getStoreContentCallback?.() ?? null;
    })
  ),
});
