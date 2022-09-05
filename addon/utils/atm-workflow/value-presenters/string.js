/**
 * Contains specification of `string` value presenters.
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
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/string/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/string/raw-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/string/table-header-row-presenter`,
  tableBodyRowValuePresenter: `${valuePresentersDefaultLocation}/string/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: () => 1,
};
