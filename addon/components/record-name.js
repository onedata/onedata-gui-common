/**
 * Shows record name (for any model) and username (only users)
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/record-name';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['record-name', 'one-label'],

  /**
   * @virtual
   * @type { { name: String, [username]: String } }
   */
  record: undefined,
});
