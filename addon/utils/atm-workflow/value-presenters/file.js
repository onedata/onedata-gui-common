/**
 * Contains specification of `file` value presenters.
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
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/file/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/file/raw-presenter`,
  visualValuePresenter: `${valuePresentersDefaultLocation}/file/visual-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/file/table-header-row-presenter`,
  tableBodyRowValuePresenter: `${valuePresentersDefaultLocation}/file/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: () => 3,
};
