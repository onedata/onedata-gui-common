/**
 * Custom extension of ember-power-select
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from 'onedata-gui-common/templates/components/one-custom-trigger';
import Trigger from 'ember-power-select/components/power-select/trigger';
import { scheduleOnce } from '@ember/runloop';
import { computed } from '@ember/object';

export default Trigger.extend({
  layout,

  autofocus: true,

  willDestroyElement() {
    this._super(...arguments);
    scheduleOnce('actions', this, this.select.actions.search, '');
  },

  inputValue: computed('select.{searchText,selected}', function inputValue() {
    return this.select.selected?.value ?? this.select.searchText;
  }),

  actions: {
    onInput(e) {
      this.onInput(e);
    },
  },
});
