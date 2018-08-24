import Component from '@ember/component';
import layout from '../templates/components/one-tokenfield';
import { computed, observer } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import 'npm:bootstrap-tokenfield';
import _ from 'lodash';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  layout,
  classNames: ['form-group'],
  classNameBindings: [
    'isNewEntryValid::new-entry-invalid',
    'isInputValid::has-error',
  ],

  initialValue: undefined,

  inputClass: '',

  isBusy: false,

  isNewEntryValid: true,
  isInputValid: true,

  newEntry: undefined,

  entriesChanged: notImplementedIgnore,
  initialized: notImplementedIgnore,

  tokenfieldId: computed('elementId', function tokenfieldId() {
    return this.get('elementId') + '-tokenfield'
  }),

  newEntryChanged() {
    safeExec(this, 'set', 'newEntry', event.currentTarget.value);
  },

  init() {
    this._super(...arguments);
  },

  isBusyChanged: observer('isBusy', function ipAddressBusyChanged() {
    const $tokenInput = this.$('.token-input');
    if ($tokenInput.length > 0) {
      const tokenfield = this.$(`#${this.get('tokenfieldId')}`);
      const isBusy = this.get('isBusy');
      tokenfield.tokenfield(isBusy ? 'disable' : 'enable');
      if (!isBusy) {
        // FIXME: issues with lost focus after disable
        tokenfield.find('.token-input').focus();
      }
    }
  }),

  initTokenfield() {
    const $input = this.$('input');
    $input.tokenfield();
    $input.on('tokenfield:createtoken', (event) => {
      const newEntry = event.attrs.value;
      const entries = $(event.currentTarget).tokenfield('getTokens').map(t => t.value);
      if (!this.get('isNewEntryValid') || _.includes(entries, newEntry)) {
        event.preventDefault();
      } else {
        this.get('entriesChanged')([...entries, newEntry]);
      }
    });
    $input.on('tokenfield:edittoken', (event) => {
      // TODO: no support for editing tokens currently
      event.preventDefault();
    });
    $input.on('tokenfield:removetoken', (event) => {
      const removedEntry = event.attrs.value;
      const entries = $(event.currentTarget).tokenfield('getTokens').map(t => t.value);
      this.get('entriesChanged')(_.without(entries, removedEntry));
    });
    $input.on('tokenfield:initialize', (event) => {
      const entries = $(event.currentTarget).tokenfield('getTokens').map(t => t.value);
      this.get('initialized')(entries);
    });

    scheduleOnce('afterRender', () => {
      this.$('.tokenfield .token-input')
        .on('input', (event) => {
          this.get('newEntryChanged')(event.currentTarget.value);
        });
      this.$();
    });
  },

  didInsertElement() {
    this._super(...arguments);
    scheduleOnce('afterRender', () => {
      this.initTokenfield();
      scheduleOnce('afterRender', () => {
        this.isBusyChanged();
        const entries = this.$(`#${this.get('tokenfieldId')}`)
          .tokenfield('getTokens').map(t => t.value);
        this.get('initialized')(entries);
      });
    });
  },

});
