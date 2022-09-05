/**
 * Contains specification of `integer` value presenters.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { valuePresentersDefaultLocation } from './commons';

/**
 * @type {ValuePresentersSpecification}
 */
export default {
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/integer/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/integer/raw-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/integer/table-header-row-presenter`,
  tableBodyRowValuePresenters: `${valuePresentersDefaultLocation}/integer/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: () => 1,
};
