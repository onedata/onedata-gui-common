/**
 * Contains specification of `array` value presenters.
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
  singleLineValuePresenter: `${valuePresentersDefaultLocation}/array/single-line-presenter`,
  rawValuePresenter: `${valuePresentersDefaultLocation}/array/raw-presenter`,
  visualValuePresenter: `${valuePresentersDefaultLocation}/array/visual-presenter`,
  tableHeaderRowValuePresenter: `${valuePresentersDefaultLocation}/array/table-header-row-presenter`,
  tableBodyRowValuePresenter: `${valuePresentersDefaultLocation}/array/table-body-row-presenter`,
  getTableValuePresenterColumnsCount: () => 1,
};
