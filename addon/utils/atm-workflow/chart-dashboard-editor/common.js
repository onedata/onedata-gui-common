/**
 * Contains things common for dashboard editor elements/tools.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import joinStrings from 'onedata-gui-common/utils/i18n/join-strings';
import {
  getFunctionNameTranslation,
  getFunctionArgumentNameTranslation,
  getFunctionParameterNameTranslation,
} from './functions-model/common';

const i18nPrefix = 'utils.atmWorkflow.chartDashboardEditor.common';

/**
 * @typedef {
 *   'chartDashboardEditorSection' |
 *   'chartDashboardEditorChart' |
 *   'chartDashboardEditorAxis' |
 *   'chartDashboardEditorSeriesGroup' |
 *   'chartDashboardEditorSeries' |
 *   'chartDashboardEditorFunction'
 * } ElementType
 * Values are so long because are used to distinguish dragged elements from
 * other elements in the GUI.
 */

/**
 * @typedef {Object<string, ElementType>}
 */
export const ElementType = Object.freeze({
  Section: 'chartDashboardEditorSection',
  Chart: 'chartDashboardEditorChart',
  Axis: 'chartDashboardEditorAxis',
  SeriesGroup: 'chartDashboardEditorSeriesGroup',
  Series: 'chartDashboardEditorSeries',
  Function: 'chartDashboardEditorFunction',
});

/**
 * @typedef {Utils.AtmWorkflow.ChartDashboardEditor.Chart | Utils.AtmWorkflow.ChartDashboardEditor.Section} SectionElement
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
 * @typedef {Utils.AtmWorkflow.ChartDashboardEditor.Axis | Utils.AtmWorkflow.ChartDashboardEditor.SeriesGroup | Utils.AtmWorkflow.ChartDashboardEditor.Series} ChartElement
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
 * @type {Object<string, (i18n: Ember.Service, validationError: DashboardElementValidationError) => Object<string, string | SafeString>}
 */
const validationErrorTranslationPlaceholdersGetters = Object.freeze({
  chartFunctionUndefinedReturnType: (i18n, { element }) => {
    return {
      functionName: getFunctionNameTranslation(i18n, element.name),
    };
  },
  chartFunctionParameterInvalid: (i18n, { element, errorDetails }) => {
    return {
      functionName: getFunctionNameTranslation(i18n, element.name),
      parameterName: getFunctionParameterNameTranslation(
        i18n,
        element.name,
        errorDetails.parameterName
      ),
    };
  },
  chartFunctionWrongArgumentTypeAssigned: (i18n, { element, errorDetails }) => {
    const compatibleTypes =
      errorDetails?.relatedAttachableArgumentSpec?.compatibleTypes ?? [];
    const translatedCompatibleTypes = compatibleTypes.map((type) => String(i18n.t(
      `${i18nPrefix}.validationErrorParts.chartFunctionWrongArgumentTypeAssigned.compatibleTypes.${type}`
    )));
    return {
      functionName: getFunctionNameTranslation(i18n, element.name),
      argumentName: getFunctionArgumentNameTranslation(
        i18n,
        element.name,
        errorDetails?.relatedAttachableArgumentSpec?.name
      ),
      compatibleTypes: joinStrings(i18n, translatedCompatibleTypes, 'or'),
    };
  },
  chartFunctionEmptyArgument: (i18n, { element, errorDetails }) => {
    return {
      functionName: getFunctionNameTranslation(i18n, element.name),
      argumentName: getFunctionArgumentNameTranslation(
        i18n,
        element.name,
        errorDetails?.relatedAttachableArgumentSpec?.name
      ),
    };
  },
  chartFunctionDetached: (i18n, { element }) => {
    return {
      functionName: getFunctionNameTranslation(i18n, element.name),
    };
  },
});

/**
 * @param {Ember.Service} i18n
 * @param {DashboardElementValidationError} validationError
 * @returns {SafeString}
 */
export function translateValidationError(i18n, validationError) {
  const errorId = validationError.errorId;
  const placeholderGetter =
    validationErrorTranslationPlaceholdersGetters[errorId] ?? (() => ({}));
  return i18n.t(
    `${i18nPrefix}.validationErrors.${validationError.errorId}`, {
      ...validationError,
      placeholders: placeholderGetter(i18n, validationError),
    }
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
 * @type {Object<ElementType, string>}
 */
export const chartElementIcons = Object.freeze({
  [ElementType.Series]: 'chart',
  [ElementType.SeriesGroup]: 'items-grid',
  [ElementType.Axis]: 'axes',
});

/**
 * @param {Ember.Service} i18n
 * @returns {SafeString}
 */
export function getUnnamedElementNamePlaceholder(i18n) {
  return i18n.t(`${i18nPrefix}.namePlaceholder`);
}

/**
 * @param {Ember.Service} i18n
 * @param {string | null} timeSeriesNameGenerator
 * @returns {SafeString}
 */
export function getRepeatedSeriesName(i18n, timeSeriesNameGenerator) {
  return i18n.t(`${i18nPrefix}.repeatedSeriesName`, {
    generatorName: timeSeriesNameGenerator ? `${timeSeriesNameGenerator}*` : '?',
  });
}

/**
 * @typedef {Object} ViewState
 * @property {SectionElement | null} selectedSectionElement
 * @property {boolean} isChartEditorActive
 * @property {ChartElement | null} selectedChartElement
 */

/**
 * @typedef {Object} ViewStateChange
 * @property {DashboardElement | null} [elementToSelect]
 * @property {boolean} [isChartEditorActive] If provided `elementToSelect` is a
 *   chart and you want to open its editor, then set this flag to `true`.
 * @property {Array<DashboardElement>} [elementsToDeselect]
 */

/**
 * @typedef {Object} ChartDashboardEditorDataSource
 * @property {string} originName Name of a model, which produced that data source
 *   (e.g. store/task name).
 * @property {string} collectionRef
 * @property {TimeSeriesCollectionSchema} timeSeriesCollectionSchema
 * @property {boolean} isDefault
 */
