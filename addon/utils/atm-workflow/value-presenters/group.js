/**
 * Contains specification of `group` value presenters.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { valuePresentersDefaultLocation } from './commons';

/**
 * @type {ValuePresentersSpecification}
 */
export default {
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/group/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/group/raw-presenter`,
  visualValuePresenter: `${valuePresentersDefaultLocation}/group/visual-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/group/table-header-row-presenter`,
  tableBodyRowValuePresenter: `${valuePresentersDefaultLocation}/group/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: () => 2,
};
