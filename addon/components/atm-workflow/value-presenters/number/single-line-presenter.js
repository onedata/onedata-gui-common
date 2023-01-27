/**
 * A "single line" number value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SingleLinePresenterBase from '../commons/single-line-presenter-base';

export default SingleLinePresenterBase.extend({
  /**
   * @override
   */
  dataSpecType: 'number',
});
