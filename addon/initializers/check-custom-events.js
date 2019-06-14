/**
 * Checks if the created application using adds customEvents handlers used
 * by this addon components. It helps to detect lack of event handler bugs.
 * 
 * @module initializers/check-custom-events
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { assert } from '@ember/debug';

export function initialize(application) {
  assert(
    'onedata-gui-common requires application to handle wheel customEvent - add it in app.js (see: https://guides.emberjs.com/release/components/handling-events/)',
    application.customEvents && application.customEvents.wheel
  );
}

export default {
  name: 'check-custom-events',
  initialize: initialize,
};
