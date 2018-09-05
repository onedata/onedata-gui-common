/**
 * Ember wrapper component for `input-tokenizer` jQuery plugin
 * 
 * @module components/one-input-tokenizer
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-input-tokenizer';
import { or } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

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

  isNewEntryValid: true,
  isInputValid: true,

  newEntry: undefined,

  tokensChanged: notImplementedIgnore,
  inputChanged: notImplementedIgnore,

  internalDisabled: or('disabled', 'isBusy'),

  inputId: computed('elementId', function inputId() {
    return this.get('elementId') + '-input-tokenizer'
  }),

  internalDisabledChanged: observer('internalDisabled', function internalDisabledChanged() {
    const internalDisabled = this.get('internalDisabled');
    if (!internalDisabled) {
      scheduleOnce('afterRender', () => this.$('.tknz-input').focus());
    }
  }),

  newEntryChanged() {
    safeExec(this, 'set', 'newEntry', event.currentTarget.value);
  },

  init() {
    this._super(...arguments);
  },

  didInsertElement() {
    this._super(...arguments);
    this.initInputTokenizer();
  },

  getTokenInput() {
    return this.$(`#${this.get('inputId')}`);
  },

  tokens: Object.freeze([]),

  tokensObserver: observer('tokens.[]', function tokensObserver() {
    const $tokenizer = this.getTokenInput();
    $tokenizer.tokenizer('empty');
    this.get('tokens').forEach(token => {
      $tokenizer.tokenizer('push', token);
    });
  }),

  inputObserver: observer('input', function inputObserver() {
    this.getTokenInput().val(this.get('input'));
  }),

  initInputTokenizer() {
    this.getTokenInput().tokenizer({
      placeholder: this.get('placeholder'),
      separators: [',', ';', ' '],
      label: '',
      callback: ($input) => {
        this.get('tokensChanged')($input.tokenizer('get'));
        this.inputObserver();
      },
    });

    this.getTokenInput().on('input', event => {
      this.get('inputChanged')(event.currentTarget.value);
    });

    scheduleOnce('afterRender', () => {
      this.inputObserver();
      this.tokensObserver();
    });
  },

});
