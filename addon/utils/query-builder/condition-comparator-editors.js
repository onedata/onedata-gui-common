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
  specialKey: [],
  stringOptions: ['stringOptions.eq'],
  numberOptions: [
    'numberOptions.eq',
    'numberOptions.lt',
    'numberOptions.lte',
    'numberOptions.gt',
    'numberOptions.gte',
  ],
  mixedOptions: [
    'stringOptions.eq',
    'numberOptions.eq',
    'numberOptions.lt',
    'numberOptions.lte',
    'numberOptions.gt',
    'numberOptions.gte',
  ],
  string: ['string.eq'],
  number: ['number.eq', 'number.lt', 'number.lte', 'number.gt', 'number.gte'],
  mixed: ['string.eq', 'number.lt', 'number.lte', 'number.gt', 'number.gte'],
};

const stringEditor = Object.freeze({
  type: 'text',
  defaultValue: () => '',
  isValidValue: value => typeof value === 'string' && value.length > 0,
});

const numberEditor = Object.freeze({
  type: 'text',
  defaultValue: () => '',
  isValidValue: value =>
    typeof value === 'string' && value.trim().length > 0 && !isNaN(Number(value)),
});

// FIXME: isValidValue
const dropdownEditor = Object.freeze({
  type: 'dropdown',
  defaultValue: () => undefined,
  isValidValue(value) {
    return this.values ? this.values.includes(value) : value;
  },
});

/**
 * Preffered editors for each property comparator
 * @type {Object}
 */
const defaultComparatorEditors = {
  'stringOptions.eq': dropdownEditor,
  'numberOptions.eq': dropdownEditor,
  'numberOptions.lt': dropdownEditor,
  'numberOptions.lte': dropdownEditor,
  'numberOptions.gt': dropdownEditor,
  'numberOptions.gte': dropdownEditor,
  'string.eq': stringEditor,
  'number.eq': numberEditor,
  'number.lt': numberEditor,
  'number.lte': numberEditor,
  'number.gt': numberEditor,
  'number.gte': numberEditor,
};

export { defaultComparators, defaultComparatorEditors };
