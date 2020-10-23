/**
 * An operator query block base class. Aggregates operands, which may be conditions or
 * another operators.
 * 
 * @module utils/query-builder/operator-query-block
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import QueryBlock from 'onedata-gui-common/utils/query-builder/query-block';
import { computed } from '@ember/object';
import { A } from '@ember/array';

export default QueryBlock.extend({
  /**
   * @override
   */
  renderer: 'operator-block',

  /**
   * A property to distinguish this class and subclasses from other query block types
   * @type {Boolean}
   */
  isOperator: true,

  /**
   * @virtual
   * @type {String}
   */
  operator: null,

  /**
   * @type {Number}
   */
  maxOperandsNumber: Number.MAX_SAFE_INTEGER,

  /**
   * @type {Array<Utils.QueryBuilder.QueryBlock>}
   */
  operands: computed(() => A()),
});
