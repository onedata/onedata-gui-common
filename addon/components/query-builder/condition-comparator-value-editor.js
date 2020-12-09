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
import { computed, get, observer } from '@ember/object';
import { defaultComparatorEditors } from 'onedata-gui-common/utils/query-builder/condition-comparator-editors';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { equal, raw } from 'ember-awesome-macros';
import { guidFor } from '@ember/object/internals';
import layout from 'onedata-gui-common/templates/components/query-builder/condition-comparator-value-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { scheduleOnce } from '@ember/runloop';

const comparatorTypeToPropertyType = {
  eq: 'all',
  lt: 'number',
  lte: 'number',
  gt: 'number',
  gte: 'number',
};

export default Component.extend(I18n, {
  layout,
  tagName: '',
  classNames: 'condition-comparator-value-editor',

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
      if (!comparator || !comparatorEditorsSet) {
        return null;
      }
      // maybe better will be:  comparatorEditor.initialize(queryProperty);
      const comparatorOptionsMatch =
        comparator.match(/(string|number)Options\.(.*)/);
      const proto = {};
      if (comparatorOptionsMatch) {
        const propertyType = comparatorTypeToPropertyType[comparatorOptionsMatch[2]];
        proto.values = this.get(`queryProperty.${propertyType}Values`) || [];
      }
      return Object.assign({}, comparatorEditorsSet[comparator], proto);
    }
  ),

  // FIXME: refactor - strategy

  /**
   * @type {ComputedProperty<any>}
   */
  viewModeComparatorValue: computed(
    'value',
    'queryProperty.key',
    function viewModeComparatorValue() {
      const value = this.get('value');
      if (typeof value === 'string') {
        return `"${value}"`;
      } else if (this.get('queryProperty.key') === 'storageId' ||
        this.get('queryProperty.key') === 'providerId'
      ) {
        // FIXME: displaying values is to refactor
        // return `${get(value, 'entityId').substring(0, 4)}… (${get(value, 'name')})`;
        return `${get(value, 'name')} (${get(value, 'entityId').substring(0, 4)}…)`;
      } else {
        return value;
      }
    }
  ),

  modeObserver: observer('mode', function modeObserver() {
    scheduleOnce('afterRender', () => {
      this.checkTextEditorInserted();
    });
  }),

  didInsertElement() {
    this._super(...arguments);
    this.checkTextEditorInserted();
  },

  checkTextEditorInserted() {
    const {
      mode,
      componentGuid,
    } = this.getProperties('mode', 'componentGuid');
    if (mode === 'edit') {
      const inputElement =
        document.querySelector(`#${componentGuid} .comparator-value`);
      if (inputElement) {
        inputElement.focus();
        if (inputElement.select) {
          inputElement.select();
        }
      }
    }
  },

  actions: {
    valueChanged(value) {
      if (this.mode === 'view') {
        return;
      }
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
        this.get('onCancelEdit')();
      }
    },

    onStartEdit() {
      this.get('onStartEdit')();
    },

    onFinishEdit() {
      if (this.mode === 'view') {
        return;
      }
      this.get('onFinishEdit')();
    },

    onSelectorBlur({ isOpen, isActive }) {
      if (isOpen && isActive) {
        return;
      }
      this.actions.onFinishEdit.call(this);
    },
  },
});
