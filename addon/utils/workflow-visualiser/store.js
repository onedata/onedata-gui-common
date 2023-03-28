/**
 * Represents single workflow store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import { resolve } from 'rsvp';
import { getStoreReadDataSpec } from 'onedata-gui-common/utils/workflow-visualiser/data-spec-converters';

export default EmberObject.extend({
  /**
   * @type {String}
   */
  __modelType: 'store',

  /**
   * @virtual
   * @type {String}
   */
  id: undefined,

  /**
   * @virtual
   * @type {String}
   */
  schemaId: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  instanceId: undefined,

  /**
   * @virtual
   * @type {String}
   */
  name: undefined,

  /**
   * @virtual
   * @type {String}
   */
  description: undefined,

  /**
   * @virtual
   * @type {String}
   */
  type: undefined,

  /**
   * @virtual optional
   * @type {Object}
   */
  config: undefined,

  /**
   * @virtual optional
   * @type {any}
   */
  defaultInitialContent: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  requiresInitialContent: undefined,

  /**
   * If true, then the content of this store can change, hence any content preview
   * should be updated regularly.
   * @virtual optional
   * @type {Boolean}
   */
  contentMayChange: true,

  /**
   * @virtual
   * @type {Array<Utils.WorkflowVisualiser.VisualiserRecord>}
   */
  referencingRecords: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Store} store
   * @param {Object} modifiedProps
   * @returns {Promise}
   */
  onModify: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Store} store
   * @returns {Promise}
   */
  onRemove: undefined,

  /**
   * @type {ComputedProperty<AtmDataSpec>}
   */
  readDataSpec: computed('type', 'config', function readDataSpec() {
    return getStoreReadDataSpec(this.getProperties('type', 'config'));
  }),

  init() {
    this._super(...arguments);
    if (!this.referencingRecords) {
      this.set('referencingRecords', []);
    }
  },

  modify(modifiedProps) {
    const onModify = this.get('onModify');
    return onModify ? onModify(this, modifiedProps) : resolve();
  },

  remove() {
    const onRemove = this.get('onRemove');
    return onRemove ? onRemove(this) : resolve();
  },

  /**
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} record
   * @returns {void}
   */
  registerReferencingRecord(record) {
    if (!this.referencingRecords.includes(record)) {
      this.set('referencingRecords', [...this.referencingRecords, record]);
    }
  },

  /**
   * @returns {void}
   */
  clearReferencingRecords() {
    this.set('referencingRecords', []);
  },
});
