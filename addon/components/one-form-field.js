/**
 * A form field tailored for Onedata application, used mainly in ``one-form-fields``
 *
 * @module components/one-form-field
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, getProperties } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-form-field';
import { invokeAction } from 'ember-invoke-action';
import config from 'ember-get-config';
import dotToDash from 'onedata-gui-common/utils/dot-to-dash';

const {
  layoutConfig,
} = config;

export default Component.extend({
  layout,
  layoutConfig,
  tagName: '',

  field: null,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  inputClasses: computed('field.{name,nolable,type}', function incputClasses() {
    const {
      name,
      nolabel,
      type,
    } = getProperties(this.get('field'), 'name', 'nolabel', 'type');

    let classes = `one-form-field field-${dotToDash(name)}`;
    if (!['dropdown', 'clipboard-line', 'capacity'].includes(type)) {
      classes += ' form-control';
    }
    if (nolabel) {
      classes += ' no-label';
    }

    return classes;
  }),

  actions: {
    inputChanged() {
      invokeAction(this, 'inputChanged', ...arguments);
    },
    onFocusOut() {
      // prevents double render issue by scheduling focusout event handler on
      // events' loop end
      setTimeout(() => invokeAction(this, 'onFocusOut', ...arguments), 0);
    },
  },
});
