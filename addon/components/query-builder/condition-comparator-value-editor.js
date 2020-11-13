/**
 * A component responsible for visualising and editing comparator values for condition
 * query blocks. Has three modes: view, edit and create
 * 
 * @module components/query-builder/condition-comparator-value-editor
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { defaultComparatorEditors } from 'onedata-gui-common/utils/query-builder/condition-comparator-editors';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { equal, raw } from 'ember-awesome-macros';
import { guidFor } from '@ember/object/internals';
import layout from 'onedata-gui-common/templates/components/query-builder/condition-comparator-value-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const valueTypes = {
  eq: 'all',
  lt: 'number',
  lte: 'number',
  gt: 'number',
  gte: 'number',
};

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18nPrefix: 'components.queryBuilder.conditionComparatorValueEditor',

  /**
   * @virtual optional
   */
  elementClass: '',

  /**
   * @type {Object}
   */
  comparatorEditorsSet: defaultComparatorEditors,

  /**
   * One of: view, edit, create
   * @type {String}
   */
  mode: 'view',

  /**
   * @virtual
   * @type {String}
   */
  comparator: '',

  /**
   * A QueryProperty instance for which value is edited
   * @virtual
   * @type {Utils.QueryProperty}
   */
  queryProperty: undefined,

  /**
   * @type {any}
   */
  value: null,

  /**
   * @type {boolean}
   */
  isValueInvalid: false,

  /**
   * @type {Function}
   * @param {any} comparatorValue
   */
  onValueChange: notImplementedIgnore,

  onStartEdit: notImplementedIgnore,

  onFinishEdit: notImplementedIgnore,

  onCancelEdit: notImplementedIgnore,

  viewMode: equal('mode', raw('view')),

  componentGuid: computed(function componentGuid() {
    return guidFor(this);
  }),

  comparatorEditor: computed(
    'comparatorEditorsSet',
    'comparator',
    'queryProperty.allValues',
    function comparatorEditor() {
      const {
        comparatorEditorsSet,
        comparator,
      } = this.getProperties('comparatorEditorsSet', 'comparator');
      const comparatorMatch = comparator.match(/(string|number)Options\.(.*)/);
      const proto = {};
      if (comparatorMatch) {
        const valueType = valueTypes[comparatorMatch[2]];
        proto.values = this.get(`queryProperty.${valueType}Values`);
      }
      return Object.assign({}, comparatorEditorsSet[comparator], proto);
    }
  ),

  /**
   * @type {ComputedProperty<any>}
   */
  viewModeComparatorValue: computed(
    'value',
    function viewModeComparatorValue() {
      const value = this.get('value');
      if (typeof value === 'string') {
        return `"${value}"`;
      } else {
        return value;
      }
    }
  ),

  didInsertElement() {
    this._super(...arguments);
    this.checkTextEditorInserted();
    this.addObserver('mode', this, 'checkTextEditorInserted');
  },

  checkTextEditorInserted() {
    const {
      mode,
      componentGuid,
    } = this.getProperties('mode', 'componentGuid');
    const inputElement =
      document.querySelector(`#${componentGuid} input[type="text"].comparator-value`);
    if (inputElement && mode === 'edit') {
      inputElement.focus();
      inputElement.select();
    }
  },

  actions: {
    valueChanged(value) {
      let newValue = value;
      if (newValue instanceof Event) {
        newValue = newValue.target.value;
      }
      this.onValueChange(newValue);
    },

    /**
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
      if (event.key === 'Enter') {
        this.get('onFinishEdit')();
      } else if (event.key === 'Escape') {
        // FIXME: workaround for finishEdit after cancelEdit (blur event) only for Chrome
        this.set('preventFinishEdit', true);
        this.get('onCancelEdit')();
      }
    },

    onStartEdit() {
      this.get('onStartEdit')();
    },

    onFinishEdit() {
      if (this.get('preventFinishEdit')) {
        this.set('preventFinishEdit', false);
      } else {
        this.get('onFinishEdit')();
      }
    },
  },
});
