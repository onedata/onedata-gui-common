/**
 * A "visual" time series measurement value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualPresenterBase from '../commons/visual-presenter-base';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/time-series-measurement/visual-presenter';

export default VisualPresenterBase.extend({
  layout,

  /**
   * @override
   */
  dataSpecType: 'timeSeriesMeasurement',
});
