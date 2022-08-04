import { dasherize } from '@ember/string';

/**
 * @type {Object<AtmDataSpecType, string>}
 */
const singleLineValuePresenters = [
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
 * Returns a name of a single line presenter component suitable for passed data spec
 * @param {AtmDataSpec} dataSpec
 * @returns {string}
 */
export function getSingleLineValuePresenter(dataSpec) {
  return singleLineValuePresenters[dataSpec?.type] ?? fallbackSingleLineValuePresenter;
}
