/**
 * Base (abstract) implementation of query value editor.
 *
 * @module components/query-builder/editors/-base-editor
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

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

  init() {
    this._super(...arguments);
    if (!this.get('params')) {
      this.set('params', {});
    }
  },
});
