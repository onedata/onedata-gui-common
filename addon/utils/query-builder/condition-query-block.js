/**
 * A condition query block. Contains information about query conditions.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import QueryBlock from 'onedata-gui-common/utils/query-builder/query-block';
import { observer } from '@ember/object';

export default QueryBlock.extend({
  /**
   * @virtual
   * @type {QueryProperty}
   */
  property: null,

  /**
   * @virtual
   * @type {String}
   */
  comparator: null,

  /**
   * @virtual
   * @type {any}
   */
  comparatorValue: null,

  /**
   * @override
   */
  renderer: 'condition-block',

  /**
   * A flag to test if this query block is condition block (instead of `instanceof`)
   * @type {Boolean}
   */
  isCondition: true,

  updateObserver: observer(
    'property',
    'comparator',
    'comparatorValue',
    function updateObserver() {
      this.get('notifyUpdate')(this);
    }
  ),
});
