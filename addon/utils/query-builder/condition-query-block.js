/**
 * A condition query block. Contains information about query conditions.
 * 
 * @module utils/query-builder/condition-query-block
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import QueryBlock from 'onedata-gui-common/utils/query-builder/query-block';
import { observer } from '@ember/object';

export default QueryBlock.extend({
  /**
   * @override
   */
  renderer: 'condition-block',

  isCondition: true,

  /**
   * @type {Utils.QueryProperty}
   */
  property: null,

  /**
   * @type {String}
   */
  comparator: null,

  /**
   * @type {any}
   */
  comparatorValue: null,

  levelScore: 1,

  updateObserver: observer(
    'property',
    'comparator',
    'comparatorValue',
    function updateObserver() {
      this.get('notifyUpdate')(this);
    }
  ),
});
