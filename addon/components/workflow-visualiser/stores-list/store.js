import Component from '@ember/component';
import layout from '../../../templates/components/workflow-visualiser/stores-list/store';
import { tag } from 'ember-awesome-macros';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-stores-list-store'],
  classNameBindings: ['modeClass'],

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
});
