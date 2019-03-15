/**
 * Renders error message in content
 *
 * @module routes/onedata/sidebar/error
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  renderTemplate(controller, model) {
    const errorType = model && get(model, 'isOnedataCustomError') && get(model, 'type');
    const template = errorType ? `errors/${errorType}` : '-internal-error';
    try {
      this.render(template, {
        into: 'onedata.sidebar.content',
        outlet: 'main-content',
      });
    } catch (error) {
      this.render('-internal-error', {
        into: 'onedata.sidebar.content',
        outlet: 'main-content',
      });
    }
  },
});
