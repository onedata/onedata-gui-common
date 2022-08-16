import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/single-value-presenter';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import Looper from 'onedata-gui-common/utils/looper';

export default Component.extend(createDataProxyMixin('valueContainer'), {
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
   * @type {number}
   */
  valueContainerUpdateInterval: 3000,

  /**
   * @type {Utils.Looper}
   */
  valueContainerUpdater: undefined,

  /**
   * @type {ComputedProperty<AtmDataSpec}
   */
  dataSpec: reads('store.config.itemDataSpec'),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    const updater = this.set('valueContainerUpdater', new Looper({
      interval: this.valueContainerUpdateInterval,
    }));
    updater.on('tick', () => this.updateValueContainerProxy({ replace: true }));
  },

  /**
   * @override
   */
  willDestroyElement() {
    this.valueContainerUpdater?.destroy();
  },

  /**
   * @override
   */
  fetchValueContainer() {
    return this.getStoreContentCallback?.({
      type: 'singleValueStoreContentBrowseOptions',
    }) ?? null;
  },
});
