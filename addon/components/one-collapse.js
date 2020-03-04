/**
 * Custom extension of ember-bootstrap bs-collapse
 *
 * @module components/one-collapse
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsCollapse from 'ember-bootstrap/components/bs-collapse';
import config from 'ember-get-config';

export default BsCollapse.extend({
  init() {
    this._super(...arguments);

    if (config.environment === 'test') {
      this.set('transitionDuration', 0);
    }
  },
});
