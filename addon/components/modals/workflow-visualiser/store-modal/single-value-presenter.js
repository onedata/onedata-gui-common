import Component from '@ember/component';
import { computed } from '@ember/object';
import { promise } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/single-value-presenter';

export default Component.extend({
  layout,
  classNames: ['single-value-presenter'],

  /**
   * @virtual
   * @type {Object}
   */
  store: undefined,

  /**
   * @virtual
   * @type {(browseOptions: AtmSingleValueStoreContentBrowseOptions) => Promise<AtmSingleValueStoreContentBrowseResult|null>}
   */
  getStoreContentCallback: undefined,

  /**
   * @virtual
   * @type {string}
   */
  emptyStoreText: undefined,

  /**
   * @type {ComputedProperty<AtmValueContainer<unknown>|null>}
   */
  valueContainerProxy: promise.object(
    computed('getStoreContentCallback', async function valueContainerProxy() {
      return this.getStoreContentCallback?.({
        type: 'singleValueStoreContentBrowseOptions',
      }) ?? null;
    })
  ),
});
