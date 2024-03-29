/**
 * A "table header row" range value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TableHeaderRowPresenterBase from '../commons/table-header-row-presenter-base';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/range/table-header-row-presenter';

export default TableHeaderRowPresenterBase.extend({
  layout,

  /**
   * @override
   */
  dataSpecType: 'range',
});
