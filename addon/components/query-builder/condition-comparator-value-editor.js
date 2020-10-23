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

export default Component.extend({
  layout,
  tagName: '',

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
    function comparatorEditor() {
      const {
        comparatorEditorsSet,
        comparator,
      } = this.getProperties('comparatorEditorsSet', 'comparator');
      return comparatorEditorsSet[comparator];
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

  test1: (event) => {
    console.dir(event);
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
        console.log(event);
        // FIXME: workaround for finishEdit after cancelEdit (blur event) only for Chrome
        this.set('preventFinishEdit', true);
        this.get('onCancelEdit')();
      }
    },

    onStartEdit() {
      this.get('onStartEdit')();
    },

    onFinishEdit(event) {
      console.dir(event);
      if (this.get('preventFinishEdit')) {
        this.set('preventFinishEdit', false);
      } else {
        this.get('onFinishEdit')();
      }
    },
  },
});
