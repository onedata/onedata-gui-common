/**
 * Contains typedefs and functions related to automation value presenters.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { dasherize } from '@ember/string';

/**
 * # WHAT ARE VALUE PRESENTERS
 *
 * Value presenters are components, which are able to visualise data processed
 * by automation workflows. These are integers, strings, object, files etc. (see
 * more in utils/atm-workflow/data-types.js). Each of that data type has it's own
 * set of presenter components.
 *
 * There are several types of presenters:
 * - "single line" - shows value as a string, which is possible to render in a
 *   single line (e.g. in tables or as an array item).
 * - "raw" - shows raw JSON representation of value.
 * - "visual" - shows more visual representation of value. For example data is
 *   rendered using some specific layout, icons and hyperlinks are added etc.
 * - "table header row" - shows table header for specific data type.
 *   It is an only presenter, which does not show specific value but uses data
 *   type information only.
 * - "table body row" - shows value in a form of table body cells. Number and
 *   meaning of cells is compatible with header cells rendered by
 *   "table header row" presenters.
 *
 * NOTE: "visual" presenter is optional and is not available for all data types.
 * It's due to a simplicity of some data types (like integers or strings) which
 * have no better visual representation than a "single line"/"raw".
 *
 * # FALLBACK PRESENTERS
 *
 * To handle situtation when there is some data type with no corresponding
 * presenter, fallback presenters were introduced. For all types of presenters
 * (except "visual") there is a fallback component which renders value in the most
 * simple and generic way (usually by showing it's JSON representation).
 *
 * # PRESENTERS CONTEXT
 *
 * Some presenters needs additional data to render specific values. E.g.
 * file presenters are able to render hyperlinks to file browser, but URL generation
 * function must be injected to make it work. In order to supply such specific
 * callbacks a context is used (see `AtmValuePresenterContext`). It is
 * *strongly* recommended to provide it to value presenters. When it is not present,
 * presenter component still work but are not fully functional.
 */

/**
 * @typedef {Object} AtmValuePresenterContext
 * Is used to pass external configuration and data sources into value
 * presenters.
 * @property {(fileId: string) => Promise<AtmFile|null>} [getSymbolicLinkTargetById]
 * @property {(fileId: string) => Promise<string|null>} [getFilePathById]
 * @property {(fileId: string) => Promise<string|null>} [getFileUrlById]
 * @property {(datasetId: string) => Promise<string|null>} [getDatasetUrlById]
 * @property {string} [linkTarget]
 */

/**
 * Contains names of "single line" presenter components for data types.
 * @type {Object<AtmDataSpecType, string>}
 */
export const singleLineValuePresenters = [
  'integer',
  'string',
  'object',
  'file',
  'dataset',
  'range',
  'array',
  'timeSeriesMeasurement',
].reduce((acc, type) => {
  acc[type] = `atm-workflow/value-presenters/${dasherize(type)}/single-line-presenter`;
  return acc;
}, {});

/**
 * A "single line" presenter component which should be used when there is no
 * fitting component in `singleLineValuePresenters`.
 * @type {string}
 */
export const fallbackSingleLineValuePresenter =
  'atm-workflow/value-presenters/fallback/single-line-presenter';

/**
 * Returns a name of a "single line" presenter component suitable for passed data spec.
 * @param {AtmDataSpec} dataSpec
 * @returns {string}
 */
export function getSingleLineValuePresenter(dataSpec) {
  return singleLineValuePresenters[dataSpec?.type] ?? fallbackSingleLineValuePresenter;
}

/**
 * Contains names of "raw" presenter components for data types.
 * @type {Object<AtmDataSpecType, string>}
 */
export const rawValuePresenters = [
  'integer',
  'string',
  'object',
  'file',
  'dataset',
  'range',
  'array',
  'timeSeriesMeasurement',
].reduce((acc, type) => {
  acc[type] = `atm-workflow/value-presenters/${dasherize(type)}/raw-presenter`;
  return acc;
}, {});

/**
 * A "raw" presenter component which should be used when there is no
 * fitting component in `rawValuePresenters`.
 * @type {string}
 */
export const fallbackRawValuePresenter =
  'atm-workflow/value-presenters/fallback/raw-presenter';

/**
 * Returns a name of a "raw" presenter component suitable for passed data spec.
 * @param {AtmDataSpec} dataSpec
 * @returns {string}
 */
export function getRawValuePresenter(dataSpec) {
  return rawValuePresenters[dataSpec?.type] ?? fallbackRawValuePresenter;
}

/**
 * Contains names of "visual" presenter components for data types.
 * @type {Object<AtmDataSpecType, string>}
 */
export const visualValuePresenters = [
  'file',
  'dataset',
  'range',
  'array',
  'timeSeriesMeasurement',
].reduce((acc, type) => {
  acc[type] = `atm-workflow/value-presenters/${dasherize(type)}/visual-presenter`;
  return acc;
}, {});

/**
 * Returns a name of a "visual" presenter component suitable for passed data spec.
 * If none was found (not all types have corresponding visual presenter), null is
 * returned.
 * @param {AtmDataSpec} dataSpec
 * @returns {string|null}
 */
export function getVisualValuePresenter(dataSpec) {
  return visualValuePresenters[dataSpec?.type] ?? null;
}

/**
 * Contains names of "table header row" presenter components for data types.
 * @type {Object<AtmDataSpecType, string>}
 */
export const tableHeaderRowValuePresenters = [
  'integer',
  'string',
  'object',
  'file',
  'dataset',
  'range',
  'array',
  'timeSeriesMeasurement',
].reduce((acc, type) => {
  acc[type] = `atm-workflow/value-presenters/${dasherize(type)}/table-header-row-presenter`;
  return acc;
}, {});

/**
 * A "table header row" presenter component which should be used when there is no
 * fitting component in `tableHeaderRowValuePresenters`.
 * @type {string}
 */
export const fallbackTableHeaderRowValuePresenter =
  'atm-workflow/value-presenters/fallback/table-header-row-presenter';

/**
 * Returns a name of a "table header row" presenter component suitable for
 * passed data spec.
 * @param {AtmDataSpec} dataSpec
 * @returns {string}
 */
export function getTableHeaderRowPresenter(dataSpec) {
  return tableHeaderRowValuePresenters[dataSpec?.type] ??
    fallbackTableHeaderRowValuePresenter;
}

/**
 * Contains names of "table body row" presenter components for data types.
 * @type {Object<AtmDataSpecType, string>}
 */
export const tableBodyRowValuePresenters = [
  'integer',
  'string',
  'object',
  'file',
  'dataset',
  'range',
  'array',
  'timeSeriesMeasurement',
].reduce((acc, type) => {
  acc[type] = `atm-workflow/value-presenters/${dasherize(type)}/table-body-row-presenter`;
  return acc;
}, {});

/**
 * A "table body row" presenter component which should be used when there is no
 * fitting component in `tableBodyRowValuePresenters`.
 * @type {string}
 */
export const fallbackTableBodyRowValuePresenter =
  'atm-workflow/value-presenters/fallback/table-body-row-presenter';

/**
 * Returns a name of a "table body row" presenter component suitable for
 * passed data spec.
 * @param {AtmDataSpec} dataSpec
 * @returns {string}
 */
export function getTableBodyRowPresenter(dataSpec) {
  return tableBodyRowValuePresenters[dataSpec?.type] ??
    fallbackTableBodyRowValuePresenter;
}

/**
 * Contains callbacks calculating number of columns in table presenters for data types.
 * @type {Object<AtmDataSpecType, (columns: Array<string>|undefined) => number>}
 */
export const tableValuePresenterColumnsCounts = {
  integer: () => 1,
  string: () => 1,
  object: (columns) => Array.isArray(columns) && columns.length ? columns.length : 1,
  file: () => 3,
  dataset: () => 2,
  range: () => 3,
  array: () => 1,
  timeSeriesMeasurement: () => 3,
};

/**
 * A callback calculating number of columns in table presenters which should be
 * used when there is no fitting callback in `tableValuePresenterColumnsCounts`.
 * @type {(columns: Array<string>|undefined) => number}
 */
export const fallbackTableValuePresenterColumnsCount = () => 1;

/**
 * Returns a number of table presenter columns.
 * @param {AtmDataSpec} dataSpec
 * @param {Array<string>} [columns]
 * @returns {number}
 */
export function getTableValuePresenterColumnsCount(dataSpec, columns) {
  return tableValuePresenterColumnsCounts[dataSpec?.type]?.(columns) ??
    fallbackTableValuePresenterColumnsCount(columns);
}
