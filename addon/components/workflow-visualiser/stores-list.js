import Component from '@ember/component';
import layout from '../../templates/components/workflow-visualiser/stores-list';
import { sort } from '@ember/object/computed';

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-stores-list'],

  /**
   * @virtual
   * @type {Array<Utils.WorkflowVisualiser.Store>}
   */
  stores: undefined,

  /**
   * @type {Array<String>}
   */
  storesSortOrder: Object.freeze(['name']),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  sortedStores: sort('stores', 'storesSortOrder'),
});
