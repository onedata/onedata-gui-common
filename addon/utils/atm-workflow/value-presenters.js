import { dasherize } from '@ember/string';

/**
 * @typedef {Object} AtmValuePresenterContext
 * @property {(fileId: string) => Promise<AtmFile>} [getSymbolicLinkTargetById]
 * @property {(fileId: string) => Promise<Array<AtmFile>>} [getFilePathById]
 * @property {(fileId: string) => Promise<string|null>} [getFileUrlById]
 * @property {(datasetId: string) => Promise<string|null>} [getDatasetUrlById]
 * @property {string} [linkTarget]
 */

/**
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
 * @type {string}
 */
export const fallbackSingleLineValuePresenter =
  'atm-workflow/value-presenters/fallback/single-line-presenter';

/**
 * Returns a name of a single line presenter component suitable for passed data spec.
 * @param {AtmDataSpec} dataSpec
 * @returns {string}
 */
export function getSingleLineValuePresenter(dataSpec) {
  return singleLineValuePresenters[dataSpec?.type] ?? fallbackSingleLineValuePresenter;
}

/**
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
 * @type {string}
 */
export const fallbackRawValuePresenter =
  'atm-workflow/value-presenters/fallback/raw-presenter';

/**
 * Returns a name of a raw presenter component suitable for passed data spec.
 * @param {AtmDataSpec} dataSpec
 * @returns {string}
 */
export function getRawValuePresenter(dataSpec) {
  return rawValuePresenters[dataSpec?.type] ?? fallbackRawValuePresenter;
}

/**
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
 * Returns a name of a visual presenter component suitable for passed data spec.
 * If none was found (not all types have corresponding visual presenter), null is
 * returned.
 * @param {AtmDataSpec} dataSpec
 * @returns {string|null}
 */
export function getVisualValuePresenter(dataSpec) {
  return visualValuePresenters[dataSpec?.type] ?? null;
}

/**
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
 * @type {string}
 */
export const fallbackTableHeaderRowValuePresenter =
  'atm-workflow/value-presenters/fallback/table-header-row-presenter';

/**
 * Returns a name of a table header row presenter component suitable for
 * passed data spec.
 * @param {AtmDataSpec} dataSpec
 * @returns {string}
 */
export function getTableHeaderRowPresenter(dataSpec) {
  return tableHeaderRowValuePresenters[dataSpec?.type] ??
    fallbackTableHeaderRowValuePresenter;
}

/**
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
 * @type {string}
 */
export const fallbackTableBodyRowValuePresenter =
  'atm-workflow/value-presenters/fallback/table-body-row-presenter';

/**
 * Returns a name of a table body row presenter component suitable for
 * passed data spec.
 * @param {AtmDataSpec} dataSpec
 * @returns {string}
 */
export function getTableBodyRowPresenter(dataSpec) {
  return tableBodyRowValuePresenters[dataSpec?.type] ??
    fallbackTableBodyRowValuePresenter;
}

/**
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
