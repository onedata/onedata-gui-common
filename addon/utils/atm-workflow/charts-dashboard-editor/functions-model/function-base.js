/**
 * Base model for all chart functions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ElementBase from '../element-base';

export default ElementBase.extend({
  /**
   * @public
   * @type {Array<FunctionAttachableArgumentSpec>}
   */
  attachableArgumentSpecs: Object.freeze([]),

  /**
   * @public
   * @virtual
   * @type {Array<FunctionDataType>}
   */
  returnedTypes: undefined,
});
