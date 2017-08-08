/**
 * A form field tailored for Onedata application, used mainly in ``one-form-fields``
 *
 * @module components/one-form-field
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-form-field';
import { invokeAction } from 'ember-invoke-action';
import config from 'ember-get-config';

const { 
  layoutConfig 
} = config;

export default Ember.Component.extend({
  layout,
  layoutConfig,
  tagName: '',

  field: null,

  actions: {
    inputChanged() {
      invokeAction(this, 'inputChanged', ...arguments);
    },
    onFocusOut() {
      // prevents double render issue by scheduling focusout event handler on
      // events' loop end
      setTimeout(() => invokeAction(this, 'onFocusOut', ...arguments), 0);
    }
  }
});
