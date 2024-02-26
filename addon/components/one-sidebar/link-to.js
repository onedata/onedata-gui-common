/**
 * Extends link-to component to an optimized version of it, special for
 * one-sidebar usage. Some original link-to fields have been changed to a scalar
 * value, because original implementation impacts performance and provides no
 * additional value in terms of functionality.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneLinkTo from 'onedata-gui-common/components/one-link-to';

export default OneLinkTo.extend({
  /**
   * @override
   */
  active: false,

  /**
   * @override
   */
  willBeActive: false,

  /**
   * @override
   */
  loading: false,
});
