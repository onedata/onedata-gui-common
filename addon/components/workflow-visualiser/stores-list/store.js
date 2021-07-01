/**
 * Shows single workflow store.
 *
 * @module components/workflow-visualiser/stores-list/store
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../templates/components/workflow-visualiser/stores-list/store';
import { tag } from 'ember-awesome-macros';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-stores-list-store', 'tag-item', 'input-element'],
  classNameBindings: [
    'modeClass',
    'store.requiresInitialValue:tag-item-warning',
  ],

  /**
   * One of: `'edit'`, `'view'`
   * @virtual
   * @type {String}
   */
  mode: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Store}
   */
  store: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  removeAction: computed(function removeAction() {
    const {
      store,
      actionsFactory,
    } = this.getProperties('store', 'actionsFactory');
    return actionsFactory.createRemoveStoreAction({ store });
  }),

  click(event) {
    const {
      mode,
      store,
      actionsFactory,
      element,
    } = this.getProperties('mode', 'store', 'actionsFactory', 'element');
    const clickableElements = [...element.querySelectorAll('.clickable')];

    if (
      clickableElements.includes(event.target) ||
      clickableElements.some(clkElement => clkElement.contains(event.target)) ||
      !element.contains(event.target)
    ) {
      // Should be handled by another clickable element.
      return;
    }

    switch (mode) {
      case 'edit':
        actionsFactory.createModifyStoreAction({ store }).execute();
        break;
      case 'view':
        actionsFactory.createViewStoreAction({ store }).execute();
        break;
    }
  },
});
