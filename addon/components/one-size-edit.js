/**
 * Data size editor with number input, unit selector and confirm/cancel support.
 * 
 * @module components/one-size-edit
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from '../templates/components/one-size-edit';
import { computed } from '@ember/object';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import OneInlineEditor from 'onedata-gui-common/components/one-inline-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { validator, buildValidations } from 'ember-cp-validations';
import { reject } from 'rsvp';

const validations = buildValidations({
  _inputValue: [
    validator('presence', true),
    validator('number', {
      gt: 0,
      allowString: true,
    }),
  ],
});

export default OneInlineEditor.extend(I18n, validations, {
  layout,

  classNames: ['one-size-edit', 'input-group', 'form-group'],
  classNameBindings: ['sizeClass', 'hasError'],

  i18nPrefix: 'components.oneSizeEdit',

  /**
   * @override
   * Disable string trimming in `one-inline-editor`
   */
  trimString: false,

  /**
   * @virtual
   * Size in bytes
   * @type {number}
   */
  value: undefined,

  /**
   * @virtual optional
   * Set to true if want to start edit mode right after insert element
   * @type {boolean}
   */
  forceStartEdit: false,

  /**
   * @virtual optional
   * Additional validator from that implements partial Ember CP Validations
   * Validator interface (has at least `message` property).
   * @type {object}
   */
  externalValidator: undefined,

  /**
   * Currently used size unit, like in `iecUnits`
   * @type {object} with properties: name, multiplicator
   */
  selectedSizeUnit: undefined,

  /**
   * True if there is validation error of entered size
   * @type {ComputedProperty<boolean>}
   */
  hasError: computed('_inEditionMode', 'validationMessage', function hasError() {
    return !!(this.get('_inEditionMode') && this.get('validationMessage'));
  }),

  /**
   * A validation message to display below size edit field
   * @type {ComputedProperty<string>}
   */
  validationMessage: computed(
    'validations.attrs._inputValue.message',
    'externalValidator.message',
    function validationMessages() {
      const internalMessage = this.get('validations.attrs._inputValue.message');
      const externalMessage = this.get('externalValidator.message');
      return externalMessage && externalMessage || internalMessage;
    }
  ),

  /**
   * Additional CSS class for changing component size
   * @type {ComputedProperty<string>}
   */
  sizeClass: computed('size', function sizeClass() {
    if (this.get('size') === 'small') {
      return 'form-group-sm input-group-sm';
    }
  }),

  /**
   * Human readable size value.
   * @type {ComputedProperty<string>}
   */
  displayedInputValue: computed('value', function displayedInputValue() {
    return bytesToString(this.get('value'));
  }),

  didInsertElement() {
    this._super(...arguments);
    if (this.get('forceStartEdit')) {
      this.send('startEdition');
    }
  },

  updateInputValue(bytes) {
    this.set('_inputValue', bytes);
  },

  actions: {
    /**
     * @override
     */
    startEdition() {
      return this.startEdition();
    },
    /**
     * @override
     */
    saveEdition() {
      if (this.get('hasError')) {
        return reject();
      } else {
        return this._super(...arguments);
      }
    },
    inputOnKeyUp(keyEvent) {
      switch (keyEvent.keyCode) {
        case 13:
          // enter
          return this.send('saveEdition')
        case 27:
          // escape
          return this.send('cancelEdition')
        default:
          break;
      }
    },
    updateInputValue(displayedInputValue) {
      this.updateInputValue(displayedInputValue);
    },
  },
});
