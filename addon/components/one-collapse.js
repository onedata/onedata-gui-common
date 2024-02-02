/**
 * Custom extension of ember-bootstrap bs-collapse
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsCollapse from 'ember-bootstrap/components/bs-collapse';
import config from 'ember-get-config';

export default class OneCollapse extends BsCollapse {
  init() {
    super.init(...arguments);

    if (config.environment === 'test') {
      this.set('transitionDuration', 0);
    }
  }
}
