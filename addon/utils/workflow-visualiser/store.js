/**
 * Represents single workflow store.
 *
 * @module utils/workflow-visualiser/store
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

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
  dataSpec: undefined,

  /**
   * @virtual optional
   * @type {any}
   */
  defaultInitialValue: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  requiresInitialValue: undefined,

  /**
   * If true, then the content of this store can change, hence any content preview
   * should be updated regularly.
   * @virtual optional
   * @type {Boolean}
   */
  contentMayChange: true,

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

  modify(modifiedProps) {
    const onModify = this.get('onModify');
    return onModify ? onModify(this, modifiedProps) : resolve();
  },

  remove() {
    const onRemove = this.get('onRemove');
    return onRemove ? onRemove(this) : resolve();
  },
});
