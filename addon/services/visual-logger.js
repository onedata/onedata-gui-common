/**
 * Allows to add a log entry that is displayed in visual logger component.
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { computed } from '@ember/object';
import { A } from '@ember/array';

export default Service.extend({
  entries: computed(() => A()),

  log(message) {
    this.get('entries').unshiftObject({
      date: new Date(),
      message,
    });
  },
});
