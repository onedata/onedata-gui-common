import Component from '@ember/component';
import layout from '../../templates/components/workflow-visualiser/stores-list';
import { sort } from '@ember/object/computed';
import { computed } from '@ember/object';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-stores-list'],

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
