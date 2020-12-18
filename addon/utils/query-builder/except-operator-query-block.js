/**
 * A subctration operator for sets.
 * 
 * @module utils/query-builder/except-operator-query-block
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OperatorQueryBlock from 'onedata-gui-common/utils/query-builder/operator-query-block';

export default OperatorQueryBlock.extend({
  /**
   * @override
   */
  operator: 'except',
});
