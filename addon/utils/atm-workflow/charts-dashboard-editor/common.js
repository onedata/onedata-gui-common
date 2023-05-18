/**
 * Contains things common for dashboard editor elements/tools.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const i18nPrefix = 'utils.atmWorkflow.chartsDashboardEditor.common';

/**
 * @typedef {
 *   'chartsDashboardEditorSection' |
 *   'chartsDashboardEditorChart' |
 *   'chartsDashboardEditorAxis' |
 *   'chartsDashboardEditorSeriesGroup' |
 *   'chartsDashboardEditorSeries'
 * } ElementType
 * Values are so long because are used to distinguish dragged elements from
 * other elements in the GUI.
 */

/**
 * @typedef {Object<string, ElementType>}
 */
export const ElementType = Object.freeze({
  Section: 'chartsDashboardEditorSection',
  Chart: 'chartsDashboardEditorChart',
  Axis: 'chartsDashboardEditorAxis',
  SeriesGroup: 'chartsDashboardEditorSeriesGroup',
  Series: 'chartsDashboardEditorSeries',
});

/**
 * @typedef {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section} SectionElement
 */

/**
 * @param {ElementType} elementType
 * @returns {boolean}
 */
export function isSectionElementType(elementType) {
  return elementType === ElementType.Section ||
    elementType === ElementType.Chart;
}

/**
 * @typedef {Utils.AtmWorkflow.ChartsDashboardEditor.Axis | Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup | Utils.AtmWorkflow.ChartsDashboardEditor.Series} ChartElement
 */

/**
 * @param {ElementType} elementType
 * @returns {boolean}
 */
export function isChartElementType(elementType) {
  return elementType === ElementType.Axis ||
    elementType === ElementType.SeriesGroup ||
    elementType === ElementType.Series;
}

/**
 * @typedef {SectionElement | ChartElement} DashboardElement
 */

/**
 * @typedef {Object} DashboardElementValidationError
 * @property {DashboardElement} element
 * @property {string} errorId
 * @property {unknown} errorDetails
 */

/**
 * @param {Ember.Service} i18n
 * @param {DashboardElementValidationError} validationError
 * @returns {SafeString}
 */
export function translateValidationError(i18n, validationError) {
  return i18n.t(
    `${i18nPrefix}.validationErrors.${validationError.errorId}`,
    validationError
  );
}

/**
 * @param {Ember.Service} i18n
 * @param {Array<DashboardElementValidationError>} validationErrors
 * @returns {SafeString | null}
 */
export function translateValidationErrorsBatch(i18n, validationErrors) {
  if (!validationErrors.length) {
    return null;
  }
  const firstErrorTranslation = translateValidationError(i18n, validationErrors[0]);
  if (validationErrors.length > 1) {
    return i18n.t(`${i18nPrefix}.validationErrorsBatch.message`, {
      firstError: firstErrorTranslation,
      otherErrorsCount: validationErrors.length - 1,
      errorsNoun: i18n.t(
        `${i18nPrefix}.validationErrorsBatch.errorNoun${validationErrors.length > 2 ? 'Plural' : 'Singular'}`
      ),
    });
  } else {
    return firstErrorTranslation;
  }
}

/**
 * @typedef {Object} ViewState
 * @property {SectionElement | null} selectedSectionElement
 * @property {boolean} isChartEditorActive
 * @property {ChartElement | null} selectedChartElement
 */

/**
 * @typedef {Object} ViewStateChange
 * @property {DashboardElement} [elementToSelect]
 * @property {boolean} [isChartEditorActive] If provided `elementToSelect` is a
 *   chart and you want to open its editor, then set this flag to `true`.
 * @property {Array<DashboardElement>} [elementsToDeselect]
 */
