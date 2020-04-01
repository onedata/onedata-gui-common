/**
 * @module components/demo-components/global-alert
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';

export default Component.extend({
  alert: service(),

  init() {
    this._super(...arguments);

    this.get('alert').show('error', 'Error modal message!', {
      detailsText: htmlSafe(
        `<code>${JSON.stringify({ message: 'some details' }, null, 2)}</code>`
      ),
    });
  },
});
