/**
 * A template of GuiMessageManager service, that should be extended (if needed)
 * in GUIs using onedata-gui-common.
 *
 * @module services/gui-message-manager
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

export default Service.extend({
  /**
   * @type {function|undefined}
   */
  privacyPolicyUrl: undefined,

  /**
   * @type {function|undefined}
   */
  acceptableUsePolicyUrl: undefined,
});
