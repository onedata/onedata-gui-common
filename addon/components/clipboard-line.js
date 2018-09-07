/**
 * An inline input with copy to clipboard button
 *
 * @module components/clipboard-line
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/clipboard-line';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  classNames: ['clipboard-line'],
  classNameBindings: ['size'],

  globalNotify: service(),
  i18n: service(),

  /**
   * @virtual
   * @type {string}
   */
  value: '',

  /**
   * @virtual
   * @type {string}
   */
  label: '',

  /**
   * @virtual optional
   * @type {string}
   */
  size: undefined,
});
