/**
 * EXCEPT operator query block for COMPLEMENT operation of RUCIO (QoS), see:
 * https://rucio.readthedocs.io/en/latest/rse_expressions.html#operators
 * We are using "except" name because it is more user-friendly.
 * 
 * @module utils/query-builder/exclude-operator-query-block
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
