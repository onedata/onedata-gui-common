/**
 * Shows list of workflow stores.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/workflow-visualiser/stores-list';
import { sort } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['workflow-visualiser-stores-list'],
  classNameBindings: ['modeClass'],

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.storesList',

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
  definedStores: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {Array<String>}
   */
  storesSortOrder: Object.freeze(['name']),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  sortedStores: sort('definedStores', 'storesSortOrder'),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  createAction: computed(function createAction() {
    return this.get('actionsFactory').createCreateStoreAction();
  }),
});
