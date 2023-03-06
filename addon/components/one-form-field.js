/**
 * A form field tailored for Onedata application, used mainly in ``one-form-fields``
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, getProperties } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-form-field';
import config from 'ember-get-config';
import dotToDash from 'onedata-gui-common/utils/dot-to-dash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { next } from '@ember/runloop';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

const {
  layoutConfig,
} = config;

export default Component.extend(I18n, {
  layout,
  layoutConfig,
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.oneFormField',

  /**
   * @virtual
   * @type {Function}
   */
  inputChanged: notImplementedThrow,

  /**
   * @virtual
   * @type {Function}
   */
  onFocusOut: notImplementedIgnore,

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
    inputChanged(fieldName, value) {
      if (this.get('value') !== value) {
        this.get('inputChanged')(fieldName, value);
      }
    },
    onFocusOut() {
      // prevents double render issue by scheduling focusout event handler on
      // events' loop end
      next(() => this.get('onFocusOut')(...arguments));
    },
  },
});
