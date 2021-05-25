/**
 * Shows list of workflow stores.
 *
 * @module components/workflow-visualiser/stores-list
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/workflow-visualiser/stores-list';
import { sort } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';
import { computed } from '@ember/object';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-stores-list'],
  classNameBindings: ['modeClass'],

  /**
   * One of: `'edit'`, `'view'`
   * @virtual
   * @type {String}
   */
  mode: undefined,

  /**
   * @virtual
   * @type {Array<Utils.WorkflowVisualiser.Store>}
   */
  stores: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Object} newStoreProps
   * @returns {|Promise}
   */
  onStoreCreate: notImplementedReject,

  /**
   * @type {Array<String>}
   */
  storesSortOrder: Object.freeze(['name']),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  sortedStores: sort('stores', 'storesSortOrder'),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  createAction: computed('onStoreCreate', function createAction() {
    const {
      onStoreCreate,
      actionsFactory,
    } = this.getProperties('onStoreCreate', 'actionsFactory');
    return actionsFactory.createCreateStoreAction({
      createStoreCallback: onStoreCreate,
    });
  }),
});
