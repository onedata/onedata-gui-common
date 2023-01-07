/**
 * Shows single value store content.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/single-value-presenter';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import Looper from 'onedata-gui-common/utils/looper';
import computedT from 'onedata-gui-common/utils/computed-t';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, createDataProxyMixin('valueContainer'), {
  layout,
  classNames: ['single-value-presenter'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.singleValuePresenter',

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
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

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
   * @type {ComputedProperty<SafeString>}
   */
  emptyStoreText: computedT('emptyStore'),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    const updater = this.set('valueContainerUpdater', Looper.create({
      interval: this.valueContainerUpdateInterval,
    }));
    updater.on('tick', () => this.updateValueContainerProxy({
      replace: true,
      replaceEmpty: true,
    }));
  },

  /**
   * @override
   */
  willDestroyElement() {
    this._super(...arguments);
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
