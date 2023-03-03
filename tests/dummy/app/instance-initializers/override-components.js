/**
 * In Ember 2.18 overriden components are not used in dummy app when some addon yields
 * their instances. It can be forced to register them in application instance.
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import overrideComponents from 'onedata-gui-common/utils/override-components';

export default {
  initialize: overrideComponents,
};
