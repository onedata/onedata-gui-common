/**
 * Renders error message in sidebar and content
 *
 * @module routes/onedata/error
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

export default Route.extend({
  renderTemplate() {
    this.render('-internal-error', {
      into: 'onedata',
      outlet: 'sidebar',
    });
    this.render('-internal-error', {
      into: 'onedata',
      outlet: 'content',
    });
  },
});
