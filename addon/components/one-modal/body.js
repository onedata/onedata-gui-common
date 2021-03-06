/**
 * Extension of ember-bootstrap modal body, that specifies custom layout.
 *
 * @module components/one-modal/body
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Body from 'ember-bootstrap/components/bs-modal/body';
import layout from 'onedata-gui-common/templates/components/one-modal/body';
import { inject as service } from '@ember/service';

export default Body.extend({
  layout,

  scrollState: service(),

  actions: {
    scrollOccurred(event) {
      this.get('scrollState').scrollOccurred(event);
    },
  },
});
