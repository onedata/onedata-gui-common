/**
 * A "table body row" range value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TableBodyRowPresenterBase from '../commons/table-body-row-presenter-base';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/range/table-body-row-presenter';

export default TableBodyRowPresenterBase.extend({
  layout,

  /**
   * @override
   */
  dataSpecType: 'range',
});
