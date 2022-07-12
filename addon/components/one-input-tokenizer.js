/**
 * Ember wrapper component for `input-tokenizer` jQuery plugin
 *
 * @module components/one-input-tokenizer
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-input-tokenizer';
import { or } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
import { scheduleOnce, debounce } from '@ember/runloop';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-ignore';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['form-group', 'one-input-tokenizer'],
  classNameBindings: [
    'internalDisabled:disabled',
    'isBusy:busy',
  ],

  initialValue: undefined,

  placeholder: '',

  inputClass: '',

  isBusy: false,

  /**
   * @virtual
   * @type {string}
   */
  inputValue: '',

  /**
   * @virtual
   * @type {Array<string>}
   */
  tokens: Object.freeze([]),

  /**
   * @type {Array<string>}
   */
  separators: Object.freeze([',', ';', ' ']),

  tokensChanged: notImplementedWarn,
  inputValueChanged: notImplementedWarn,

  internalDisabled: or('disabled', 'isBusy'),

  inputId: computed('elementId', function inputId() {
    return this.get('elementId') + '-input-tokenizer';
  }),

  internalDisabledChanged: observer('internalDisabled', function internalDisabledChanged() {
    const internalDisabled = this.get('internalDisabled');
    if (!internalDisabled) {
      scheduleOnce('afterRender', () => {
        const element = this.get('element');
        const input = element && element.querySelector('.tknz-input');
        if (input) {
          input.focus();
        }
      });
    }
  }),

  tokensObserver: observer('tokens.[]', function tokensObserver() {
    const $tokenizer = this.getTokenInput();
    if (!$tokenizer) {
      return;
    }
    $tokenizer.tokenizer('empty');
    this.get('tokens').forEach(token => {
      $tokenizer.tokenizer('push', token);
    });
    scheduleOnce('afterRender', () => this.adjustHeight());
  }),

  inputObserver: observer('inputValue', function inputObserver() {
    const $input = this.getTokenInput();
    if ($input) {
      $input.val(this.get('inputValue'));
    }
  }),

  didInsertElement() {
    this._super(...arguments);
    this.initInputTokenizer();
    $(window).on(`resize.${this.elementId}`, () => debounce(this, 'adjustHeight', 100));
    scheduleOnce('afterRender', () => this.adjustHeight());
  },

  willDestroyElement() {
    this._super(...arguments);
    $(window).off(`.${this.elementId}`);
  },

  // TODO: currently only makes input larger, not smaller
  adjustHeight() {
    const element = this.get('element');
    /** @type {HTMLElement} */
    const inputWrapper = element && element.querySelector('.tknz-input-wrapper')[0];
    /** @type {HTMLElement} */
    const wrapper = element && element.querySelector('.tknz-wrapper')[0];
    if (!inputWrapper || !wrapper) {
      return;
    }
    if (inputWrapper.offsetTop + inputWrapper.offsetHeight > wrapper.offsetHeight) {
      const currentHeight = parseInt(window.getComputedStyle(wrapper).height);
      wrapper.style.height = currentHeight + 24 + 'px';
    }
  },

  getTokenInput() {
    const element = this.get('element');
    const input = element && element.querySelector(`#${this.get('inputId')}`);
    return input ? $(input) : $();
  },

  initInputTokenizer() {
    const {
      placeholder,
      separators,
      tokensChanged,
      element,
    } = this.getProperties('placeholder', 'separators', 'tokensChanged', 'element');

    const $tokenInput = this.getTokenInput();

    $tokenInput.tokenizer({
      placeholder,
      separators,
      label: '',
      callback: ($input) => {
        tokensChanged($input.tokenizer('get'));
        this.inputObserver();
      },
    });

    $tokenInput.on('input', event => {
      this.get('inputValueChanged')(event.currentTarget.value);
    });

    // prevent invoking "back" in Firefox when pressing backspace
    element.addEventListener('keydown', (event) => {
      if (event.which === 8) {
        event.stopPropagation();
      }
    });

    scheduleOnce('afterRender', () => {
      this.inputObserver();
      this.tokensObserver();
    });
  },

});
