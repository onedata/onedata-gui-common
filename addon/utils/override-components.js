/**
 * In Ember 2.18 overriden components are not used in dummy app when some addon yields
 * their instances. It can be forced to register them in application instance.
 * 
 * @module utils/override-components
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneModalBody from 'onedata-gui-common/components/one-modal/body';
import OneModal from 'onedata-gui-common/components/one-modal';

export default function overrideComponents(applicationInstance) {
  applicationInstance.register('component:bs-modal/body', OneModalBody);
  applicationInstance.register('component:bs-modal', OneModal);
}
