/**
 * Contains specification of `range` value presenters.
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
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/range/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/range/raw-presenter`,
  visualValuePresenter: `${valuePresentersDefaultLocation}/range/visual-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/range/table-header-row-presenter`,
  tableBodyRowValuePresenter: `${valuePresentersDefaultLocation}/range/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: () => 3,
};
