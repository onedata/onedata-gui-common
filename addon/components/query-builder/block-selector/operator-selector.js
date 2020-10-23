/**
 * Allows to select one of the operators. Specified ones can be disabled. Notifies about
 * selected operator using its name, not query block instance.
 * 
 * @module components/query-builder/block-selector/operator-selector
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import layout from 'onedata-gui-common/templates/components/query-builder/block-selector/operator-selector';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,

  tagName: 'ul',
  classNames: ['operator-selector'],

  /**
   * @override
   */
  i18nPrefix: 'components.queryBuilder.blockSelector.operatorSelector',

  /**
   * @virtual optional
   * @type {Array<String>}
   */
  operators: undefined,

  /**
   * @type {Array<String>}
   */
  validOperators: Object.freeze(['and', 'or', 'not']),

  /**
   * @type {Array<String>}
   */
  disabledOperators: Object.freeze([]),

  /**
   * @virtual optional
   * @param {String} selectedOperator
   * @type {Function}
   */
  onOperatorSelected: notImplementedIgnore,

  /**
   * @type {ComputedProperty<string[]>}
   */
  availableOperators: computed(
    'operators.[]',
    'validOperators.[]',
    function availableOerators() {
      const {
        operators,
        validOperators,
      } = this.getProperties('operators', 'validOperators');
      return operators ?
        operators.filter(operator => validOperators.includes(operator)) :
        validOperators;
    }
  ),

  /**
   * @type {ComputedProperty<Array<{ name: String, disabled: boolean }>>}
   */
  operatorsSpec: computed(
    'availableOperators.[]',
    'disabledOperators.[]',
    function operatorsSpec() {
      const {
        availableOperators,
        disabledOperators,
      } = this.getProperties('availableOperators', 'disabledOperators');
      return availableOperators.map(operatorName => ({
        name: operatorName,
        disabled: disabledOperators.includes(operatorName),
      }));
    }
  ),

  actions: {
    onOperatorSelected(operatorName) {
      this.get('onOperatorSelected')(operatorName);
    },
  },
});
