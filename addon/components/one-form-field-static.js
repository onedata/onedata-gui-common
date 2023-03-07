/**
 * Renders an element that looks like input, but is only for display
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import layout from 'onedata-gui-common/templates/components/one-form-field-static';
import config from 'ember-get-config';

const {
  layoutConfig,
} = config;

export default Component.extend({
  layout,
  layoutConfig,
  tagName: '',

  field: null,

  fakePassword: false,
});
