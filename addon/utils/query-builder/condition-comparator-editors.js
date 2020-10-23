/**
 * Exports specification of editors for various types of index properties.
 * 
 * @module utils/query-builder/condition-comparator-editors
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * Contains a list of allowed comparators for each property type.
 * @type {Object}
 */
const defaultComparators = {
  string: ['string.eq'],
  number: ['number.eq', 'number.lt', 'number.lte', 'number.gt', 'number.gte'],
  mixed: ['string.eq', 'number.lt', 'number.lte', 'number.gt', 'number.gte'],
};

const stringEditor = {
  type: 'text',
  defaultValue: () => '',
  isValidValue: value => typeof value === 'string' && value.length > 0,
};

const numberEditor = {
  type: 'text',
  defaultValue: () => '',
  isValidValue: value =>
    typeof value === 'string' && value.trim().length > 0 && !isNaN(Number(value)),
};

/**
 * Preffered editors for each property comparator
 * @type {Object}
 */
const defaultComparatorEditors = {
  'string.eq': stringEditor,
  'number.eq': numberEditor,
  'number.lt': numberEditor,
  'number.lte': numberEditor,
  'number.gt': numberEditor,
  'number.gte': numberEditor,
};

export { defaultComparators, defaultComparatorEditors };
