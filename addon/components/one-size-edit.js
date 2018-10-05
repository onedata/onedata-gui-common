/**
 * Data size editor with number input, unit selector and confirm/cancel support.
 * 
 * @module components/one-size-edit
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from '../templates/components/one-size-edit';
import { computed } from '@ember/object';
import bytesToString, { iecUnits } from 'onedata-gui-common/utils/bytes-to-string';
import OneInlineEditor from 'onedata-gui-common/components/one-inline-editor';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { validator, buildValidations } from 'ember-cp-validations';
import { and } from '@ember/object/computed';

const validations = buildValidations({
  _inputValue: [
    validator('presence', true),
    validator('number', { gt: 0 })
  ],
});

export default OneInlineEditor.extend(I18n, validations, {
  layout,

  classNames: ['one-size-edit', 'input-group', 'form-group'],
  classNameBindings: ['sizeClass', 'hasError:has-error'],

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
  hasError: and('_inEditionMode', 'validationMessage'),

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
      return 'input-group-sm';
    }
  }),

  /**
   * Human readable size value.
   * If only displaying value - it will full size string with unit (eg. '10 MiB')
   * If editing - it will be numerical value of size according to currently
   * selected size unit (eg. 3).
   * @type {ComputedProperty<number|string>}
   */
  displayedInputValue: computed(
    '_inEditionMode',
    'separatedInputValue',
    'selectedSupportSizeUnit',
    '_inputValue',
    'value',
    function displayedInputValue() {
      if (this.get('_inEditionMode')) {
        const unit = this.get('selectedSupportSizeUnit');
        if (unit) {
          return Math.round(this.get('_inputValue') / unit.multiplicator * 10) / 10;
        }
      } else {
        return bytesToString(this.get('value'));
      }
    }
  ),

  /**
   * Array of objects describing size units that will be displayed
   * in unit selector. Like `iecUnits` from `bytes-to-string`.
   * @type {ComputedProperty<Array<object>>}
   */
  sizeUnits: computed(function sizeUnits() {
    return ['MiB', 'GiB', 'TiB', 'PiB'].map(name =>
      iecUnits.find(u => u.name === name)
    );
  }),

  /**
   * Edited size in bytes
   * @type {ComputedProperty<number|undefined>}
   */
  editedSupportSize: computed(
    'editedSupportSizeInput',
    'selectedSupportSizeUnit',
    function editedSupportSize() {
      const {
        editedSupportSizeInput,
        selectedSupportSizeUnit,
      } = this.getProperties('editedSupportSizeInput', 'selectedSupportSizeUnit');
      if (editedSupportSizeInput != null && selectedSupportSizeUnit) {
        return Number(editedSupportSizeInput) * selectedSupportSizeUnit.multiplicator;
      }
    }
  ),

  didInsertElement() {
    if (this.get('forceStartEdit')) {
      this.send('startEdition');
    }
  },

  updateInputValue(displayedInputValue) {
    const selectedSupportSizeUnit = this.get('selectedSupportSizeUnit')
    if (selectedSupportSizeUnit) {
      const newValue = displayedInputValue * selectedSupportSizeUnit.multiplicator;
      this.set(
        'tmpDisplayedInputValue',
        isNaN(Number(newValue)) ? displayedInputValue : undefined
      );
      this.set('_inputValue', newValue);
    }
  },

  updateSelectedSupportSizeUnit(selectedSupportSizeUnit) {
    this.setProperties({
      selectedSupportSizeUnit,
      _inputValue: this.get('displayedInputValue') * selectedSupportSizeUnit.multiplicator,
    });
  },

  actions: {
    /**
     * @override
     */
    startEdition() {
      return this.startEdition()
        .then(() => {
          const { number, unit } = bytesToString(this.get('_inputValue'), { separated: true });
          const selectedSupportSizeUnit = iecUnits.find(u => u.name === unit);
          safeExec(
            this,
            'set',
            'selectedSupportSizeUnit',
            selectedSupportSizeUnit
          );
          this.updateInputValue(number);
        });
    },
    /**
     * @override
     */
    endEdition() {
      this._super(...arguments);
      this.setProperties({
        editing: false,
        _inputValue: undefined,
        selectedSupportSizeUnit: undefined,
      });
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
    updateSelectedSupportSizeUnit(selectedSupportSizeUnit) {
      this.updateSelectedSupportSizeUnit(selectedSupportSizeUnit);
    },
  },
});
