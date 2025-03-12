/**
 * Custom extension of ember-power-select
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from 'onedata-gui-common/templates/components/one-custom-trigger';
import Trigger from 'ember-power-select/components/power-select/trigger';
import { computed } from '@ember/object';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';

export default Trigger.extend({
  layout,

  /**
   * @virtual
   * @type {Function}
   */
  onInput: notImplementedWarn,

  /**
   * @type {ComputedProperty<string>}
   */
  inputValue: computed('select.{searchText,selected}', function inputValue() {
    return this.select.selected?.value ?? this.select.searchText;
  }),

  actions: {
    onInput(e) {
      this.onInput(e);
    },
  },
});
