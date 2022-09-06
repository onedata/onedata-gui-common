/**
 * Contains specification of `dataset` value presenters.
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
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/dataset/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/dataset/raw-presenter`,
  visualValuePresenter: `${valuePresentersDefaultLocation}/dataset/visual-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/dataset/table-header-row-presenter`,
  tableBodyRowValuePresenter: `${valuePresentersDefaultLocation}/dataset/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: () => 2,
};
