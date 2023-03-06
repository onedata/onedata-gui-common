/**
 * Controls pointer-events styles for main layout elements. Allows to passthrough mouse events
 * to specified DOM nodes (that are behind another nodes).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

export default Service.extend({
  /**
   * If true, all pointer events will be ignored in place of main-content element
   * @type {boolean}
   */
  pointerNoneToMainContent: false,
});
