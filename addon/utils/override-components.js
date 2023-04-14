/**
 * In Ember 2.18 overriden components are not used in dummy app when some addon yields
 * their instances. It can be forced to register them in application instance.
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberAce from 'onedata-gui-common/components/ember-ace';
import OneModalBody from 'onedata-gui-common/components/one-modal/body';
import OneModal from 'onedata-gui-common/components/one-modal';

/**
 * Maps: fullName -> factory (Ember class) of component to be overriden
 */
const overrides = {
  'component:bs-modal/body': OneModalBody,
  'component:bs-modal': OneModal,
  'component:ember-ace': EmberAce,
};

export default function overrideComponents(applicationInstance) {
  Object.entries(overrides).forEach(([fullName, factory]) => {
    applicationInstance.register(fullName, factory);
  });
}
