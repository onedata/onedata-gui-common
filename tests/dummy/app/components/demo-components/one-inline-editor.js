/**
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  exampleValue: 'test string',

  actions: {
    save(newValue) {
      return new Promise((resolve) => {
        setTimeout(() => {
          safeExec(this, 'set', 'exampleValue', newValue);
          resolve();
        }, 1000);
      });
    },
  },
});
