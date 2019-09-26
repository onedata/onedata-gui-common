/**
 * Helper component for displaying loading container in components using
 * `error-check-view` mixin
 * 
 * @module components/error-check-view
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { or, equal, raw } from 'ember-awesome-macros';
import layout from '../templates/components/error-check-view';

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @virtual
   */
  tryErrorCheckProxy: undefined,

  /**
   * @virtual
   */
  errorCheckProxy: undefined,

  isLoading: or(
    'tryErrorCheckProxy.isPending',
    equal('errorCheckProxy.content', raw(false))
  ),
});
