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
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { equal, raw } from 'ember-awesome-macros';
import { guidFor } from '@ember/object/internals';
import layout from 'onedata-gui-common/templates/components/query-builder/condition-comparator-value-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const comparatorTypeToPropertyType = {
  eq: 'all',
  lt: 'number',
  lte: 'number',
  gt: 'number',
  gte: 'number',
};

const mixins = [
  I18n,
];

export default Component.extend(...mixins, {
  layout,
  tagName: '',
  classNames: 'condition-comparator-value-editor',

  i18nPrefix: 'components.queryBuilder.conditionComparatorValueEditor',

  /**
   * @virtual optional
   * @type {String}
   */
  elementClass: '',

  /**
   * One of: view, edit, create
   * @virtual
   * @type {String}
   */
  mode: 'view',

  /**
   * @virtual
   * @type {string}
   */
  comparator: undefined,

  /**
   * @virtual
   * @type {any}
   */
  value: null,

  /**
   * @virtual
   * @type {boolean}
   */
  isValueInvalid: false,

  /**
   * @virtual
   * @type {OnedataGuiCommon.Utils.QueryComponentValueBuilder}
   */
  valuesBuilder: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {any} comparatorValue
   */
  onValueChange: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onStartEdit: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onFinishEdit: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onCancelEdit: notImplementedIgnore,

  /**
   * A QueryProperty instance for which value is edited
   * @virtual optional
   * @type {Utils.QueryProperty}
   */
  queryProperty: undefined,

  viewMode: equal('mode', raw('view')),

  /**
   * @type {ComputedProperty<{ componentName: string, params: Object }>}
   */
  editorSpec: computed('valuesBuilder', 'comparator', 'mode', function editorSpec() {
    const {
      valuesBuilder,
      comparator,
      mode,
      queryProperty,
    } = this.getProperties('valuesBuilder', 'comparator', 'mode', 'queryProperty');
    if (valuesBuilder) {
      return valuesBuilder.getEditorFor(comparator, queryProperty, mode === 'edit');
    } else {
      console.warn(
        'component:...condition-comparator-value-editor: requested editorSpec, but no valuesBuilder provided'
      );
    }
  }),

  /**
   * @type {ComputedProperty<>}
   */
  presenterComponentName: computed(
    'valuesBuilder',
    'comparator',
    function presenterComponentName() {
      const {
        valuesBuilder,
        comparator,
      } = this.getProperties('valuesBuilder', 'comparator');
      if (valuesBuilder) {
        return valuesBuilder.getPresenterFor(comparator);
      }
    }
  ),

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

  actions: {
    valueChanged(value) {
      if (this.get('mode') === 'view') {
        return;
      }
      let newValue = value;
      if (newValue instanceof Event) {
        newValue = newValue.target.value;
      }
      this.onValueChange(newValue);
    },

    onStartEdit() {
      this.get('onStartEdit')();
    },

    onFinishEdit() {
      if (this.get('mode') === 'view') {
        return;
      }
      this.get('onFinishEdit')();
    },
  },
});
