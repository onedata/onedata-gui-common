/**
 * A template of PrivacyPolicyManager service, that should be extended (if needed)
 * in GUIs using onedata-gui-common.
 *
 * @module services/privacy-policy-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

export default Service.extend({
  /**
   * @type {function|undefined}
   */
  showPrivacyPolicyAction: undefined,
});
