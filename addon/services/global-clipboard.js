/**
 * A service which provides global copying to clipboard
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import $ from 'jquery';
import { scheduleOnce } from '@ember/runloop';

export default Service.extend({
  /**
   * @type {string}
   */
  textToCopy: undefined,

  /**
   * @type {string}
   */
  textType: undefined,

  copy(textToCopy, textType) {
    this.setProperties({
      textToCopy,
      textType,
    });
    scheduleOnce('afterRender', () => {
      $('.btn-global-copy-button').click();
    });
  },

  endCopy() {
    this.setProperties({
      textToCopy: undefined,
      textType: undefined,
    });
  },
});
