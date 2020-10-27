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
   * @virtual optional
   * @param {String} selectedOperator
   * @type {Function}
   */
  onOperatorSelected: notImplementedIgnore,

  /**
   * @type {Array<String>}
   */
  validOperators: Object.freeze(['and', 'or', 'excluding', 'not']),

  /**
   * @type {Array<String>}
   */
  disabledOperators: Object.freeze([]),

  /**
   * Protection for mulitple clicks on selected operator - turns to true right after
   * selection (click) event and then disables buttons.
   * @type {Boolean}
   */
  selectionDone: false,

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
      this.set('selectionDone');
      this.get('onOperatorSelected')(operatorName);
    },
  },
});
