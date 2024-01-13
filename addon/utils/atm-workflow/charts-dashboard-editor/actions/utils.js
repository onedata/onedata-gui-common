/**
 * A collection of utils commonly used by dashboard actions code.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { ElementType } from '../common';

/**
 * Returns name of a field, which is responsible for aggregating elements of
 * provided type. These fields are present in elements which act as a parent
 * for aggregated items. Example returns `'axes'` from `ElementType.Axis`
 * because axes are aggregated inside chart objects in `'axes'` field.
 * @param {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType} childElementType
 * @returns {string | null}
 */
export function getCollectionFieldName(childElementType) {
  switch (childElementType) {
    case ElementType.Section:
      return 'sections';
    case ElementType.Chart:
      return 'charts';
    case ElementType.Axis:
      return 'axes';
    case ElementType.SeriesGroup:
      return 'seriesGroups';
    case ElementType.Series:
      return 'series';
    default:
      return null;
  }
}

export class ChangedElementsSet {
  constructor() {
    /**
     * @type {Set<Utils.AtmWorkflow.ChartsDashboardEditor.ElementBase>}
     */
    this.changedElements = new Set();
  }

  /**
   * @public
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.ElementBase} element
   * @returns {void}
   */
  addElement(element) {
    this.changedElements.add(element);
  }

  /**
   * @public
   * @void
   */
  notifyAboutChange() {
    this.changedElements.forEach((element) => element.notifyAboutChange());
  }
}
