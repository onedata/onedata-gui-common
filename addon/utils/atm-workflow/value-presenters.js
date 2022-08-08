import { dasherize } from '@ember/string';

/**
 * @typedef {Object} AtmValuePresenterContext
 * @property {(fileId: string) => Promise<AtmFile>} [getSymbolicLinkTargetById]
 * @property {(fileId: string) => Promise<Array<AtmFile>>} [getFilePathById]
 * @property {(fileId: string) => Promise<string>} [getFileUrlById]
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
  return rawValuePresenters[dataSpec?.type] ?? null;
}
