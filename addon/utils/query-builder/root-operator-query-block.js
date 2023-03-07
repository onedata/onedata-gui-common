/**
 * An operator query block for root of query block hierarchy.
 * Can have only one operand.
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OperatorQueryBlock from 'onedata-gui-common/utils/query-builder/operator-query-block';

export default OperatorQueryBlock.extend({
  /**
   * @override
   */
  maxOperandsNumber: 1,

  /**
   * @override
   */
  operator: 'root',
});
