/**
 * Contains specification of `number` value presenters.
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
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/number/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/number/raw-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/number/table-header-row-presenter`,
  tableBodyRowValuePresenter: `${valuePresentersDefaultLocation}/number/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: () => 1,
};
