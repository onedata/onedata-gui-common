/**
 * Base (abstract) implementation of query value editor.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { reads } from '@ember/object/computed';

export default Component.extend({
  /**
   * @virtual
   * @type {any}
   */
  value: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  params: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  isValueInvalid: false,

  /**
   * @virtual
   * @type {Function}
   */
  onValueChange: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onFinishEdit: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onCancelEdit: notImplementedIgnore,

  // TODO: https://jira.onedata.org/browse/VFS-7145
  /**
   * @override
   */
  touchActionProperties: 'touch-action: manipulation;',

  /**
   * @type {ComputedProperty<Boolean>}
   */
  initiallyFocused: reads('params.initiallyFocused'),

  init() {
    this._super(...arguments);
    if (!this.get('params')) {
      this.set('params', {});
    }
  },
});
