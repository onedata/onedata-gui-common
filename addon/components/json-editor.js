/**
 * JSON editor component with validation
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/json-editor';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  layout,
  classNames: ['json-editor'],
  classNameBindings: ['bootstrapClasses'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.jsonEditor',

  /**
   * @type {string}
   */
  value: '',

  /**
   * @type {boolean}
   */
  isValid: true,

  /**
   * @type {string}
   */
  pladeholder: undefined,

  /**
   * @type {boolean}
   */
  disabled: false,

  /**
   * @type {boolean}
   */
  readonly: false,

  /**
   * @type {boolean}
   */
  useBootstrapClasses: true,

  /**
   * @type {boolean}
   */
  isErrorMsgVisible: true,

  /**
   * @type {boolean}
   */
  acceptEmptyString: false,

  /**
   * @type {Function}
   * @param {Object} change
   * @param {string} change.value
   * @param {Object|undefined} change.parsedValue
   * @param {boolean} change.isValid
   * @returns {undefined}
   */
  onChange: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {Function}
   */
  onFocusLost: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  inputId: computed('elementId', {
    get() {
      return this.injectedInputId ?? (this.elementId + '-textarea');
    },
    set(key, value) {
      return this.injectedInputId = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedInputId: null,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  bootstrapClasses: computed(
    'useBootstrapClasses',
    'isValid',
    'disabled',
    'readonly',
    function bootstrapClasses() {
      const {
        useBootstrapClasses,
        isValid,
        disabled,
        readonly,
      } = this.getProperties(
        'useBootstrapClasses',
        'isValid',
        'disabled',
        'readonly'
      );
      if (useBootstrapClasses) {
        let classes = 'form-group';
        if (!disabled && !readonly) {
          if (isValid === true) {
            classes += ' has-success';
          } else if (isValid === false) {
            classes += ' has-error';
          }
        }
        return classes;
      } else {
        return '';
      }
    }
  ),

  recalculateValue(value) {
    const {
      onChange,
      acceptEmptyString,
    } = this.getProperties('onChange', 'acceptEmptyString');
    let isValid = true;
    let parsedValue;
    if (acceptEmptyString && value === '') {
      parsedValue = null;
    } else {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        isValid = false;
      }
    }
    this.set('isValid', isValid);
    onChange({
      value,
      parsedValue,
      isValid,
    });
  },

  actions: {
    onChange(value) {
      this.recalculateValue(value);
    },
  },
});
