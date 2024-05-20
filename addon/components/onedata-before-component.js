/**
 * Override this empty component to put some content before app-layout element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  /**
   * @virtual
   * @type {unknown}
   */
  controller: undefined,
});
