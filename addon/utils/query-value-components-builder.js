/**
 * Is responsible for generating view/editor component names, default values and validators
 * for query comparators.
 *
 * @module utils/query-value-components-builder
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get } from '@ember/object';

export default EmberObject.extend({
  /**
   * @param {String} propertyType
   * @returns {Array<String>}
   */
  getComparatorsFor(propertyType) {
    switch (propertyType) {
      case 'string':
        return ['string.eq'];
      case 'number':
        return ['number.eq', 'number.lt', 'number.lte', 'number.gt', 'number.gte'];
      case 'stringOptions':
        return ['stringOptions.eq'];
      case 'numberOptions':
        return [
          'numberOptions.eq',
          'numberOptions.lt',
          'numberOptions.lte',
          'numberOptions.gt',
          'numberOptions.gte',
        ];
      case 'mixedOptions':
        return [
          'mixedOptions.eq',
          'mixedOptions.lt',
          'mixedOptions.lte',
          'mixedOptions.gt',
          'mixedOptions.gte',
        ];
      case 'symbol':
      default:
        return [];
    }
  },

  /**
   * @param {String} comparator
   * @returns {any}
   */
  getDefaultValueFor( /* comparator */ ) {
    return '';
  },

  /**
   * @param {String} comparator
   * @returns {(comparator: string) => boolean}
   */
  getValidatorFor(comparator) {
    // special case for comparator-less types (eg. symbol)
    if (comparator === undefined) {
      return () => true;
    } else if (
      comparator.match(/^mixedOptions\.(eq|lt|lte|gt|gte)$/)
    ) {
      return value =>
        typeof value === 'string' && value.length > 0 ||
        typeof value === 'number' && !isNaN(value);
    } else if (comparator.match(/^string(Options)?\.eq$/)) {
      return value =>
        typeof value === 'string' && value.trim().length > 0;
    } else if (comparator.match(/^(number(Options)?\.(eq|lt|lte|gt|gte)?)$/)) {
      return value =>
        typeof value === 'number' && !isNaN(value) ||
        typeof value === 'string' && value.trim().length > 0 && !isNaN(Number(value));
    } else if (comparator === 'symbol') {
      return () => true;
    } else {
      console.warn(
        `util:query-value-components-builder#getValidatorFor: unknown comparator "${comparator}"`
      );
      return () => true;
    }
  },

  /**
   * @param {String} comparator
   * @param {Object} queryProperty
   * @param {Boolean} [initiallyFocused=false]
   * @returns {{ componentName: String, params: Object }}
   */
  getEditorFor(comparator, queryProperty, initiallyFocused = false) {
    let componentName;
    let params = {};
    // special case for comparator-less types (eg. symbol)
    if (comparator === undefined) {
      componentName = null;
    } else if (comparator.match(/^(string\.eq|number\.(eq|lt|lte|gt|gte))$/)) {
      componentName = 'text-editor';
    } else if (comparator.match(/^(stringOptions\.eq|(mixed|number)Options\.(eq|lt|lte|gt|gte))$/)) {
      componentName = 'dropdown-editor';
      const [propertyType, operator] = comparator.split('.');
      let values;
      if (
        propertyType === 'numberOptions' ||
        propertyType === 'mixedOptions' && operator.match(/^(lt|lte|gt|gte)$/)
      ) {
        values = get(queryProperty, 'numberValues');
      } else if (propertyType === 'stringOptions') {
        values = get(queryProperty, 'stringValues');
      } else {
        values = get(queryProperty, 'allValues');
      }
      params = { values };
    } else {
      console.warn(
        `util:query-value-components-builder#getEditorFor: unknown comparator "${comparator}"`
      );
      componentName = 'text-editor';
    }

    return this.createEditorObject(componentName, params, initiallyFocused);
  },

  createEditorObject(componentName, params = {}, initiallyFocused = false) {
    return { componentName, params: Object.assign({ initiallyFocused }, params) };
  },

  /**
   * @param {String} comparator
   * @returns {String} componentName
   */
  getPresenterFor(comparator) {
    // special case for comparator-less types (eg. symbol)
    if (comparator === undefined) {
      return null;
    } else if (comparator.match(/^string(Options)?\.eq$/)) {
      return 'string-presenter';
    } else if (comparator.startsWith('number')) {
      return 'raw-presenter';
    } else if (comparator.startsWith('mixedOptions')) {
      const operator = comparator.split('.')[1];
      if (operator.match(/^(lt|lte|gt|gte)$/)) {
        return 'raw-presenter';
      } else if (operator === 'eq') {
        return 'string-presenter';
      } else {
        console.warn(
          `util:query-value-components-builder#getPresenterFor: unknown comparator "${comparator}"`
        );
        return 'raw-presenter';
      }
    } else {
      console.warn(
        `util:query-value-components-builder#getPresenterFor: unknown comparator "${comparator}"`
      );
      return 'raw-presenter';
    }
  },
});
