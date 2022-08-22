/**
 * A "raw" range value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RawPresenterBase from '../commons/raw-presenter-base';

export default RawPresenterBase.extend({
  /**
   * @override
   */
  dataSpecType: 'range',
});
