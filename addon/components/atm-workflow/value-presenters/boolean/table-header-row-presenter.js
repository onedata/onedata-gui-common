/**
 * A "table header row" boolean value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TableHeaderRowPresenterBase from '../commons/table-header-row-presenter-base';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/boolean/table-header-row-presenter';

export default TableHeaderRowPresenterBase.extend({
  layout,

  /**
   * @override
   */
  dataSpecType: 'boolean',
});
