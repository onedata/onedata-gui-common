import Component from '@ember/component';
import layout from '../../../templates/components/workflow-visualiser/stores-list/store';

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-stores-list-store'],

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

  actions: {
    remove() {
      this.get('store').remove();
    },
  },
});
