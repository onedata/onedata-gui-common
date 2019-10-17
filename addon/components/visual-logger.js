/**
 * Shows a floating text block containing log entries from `visual-logger` *
 * service. Use `visualLogger.log(message: string)` to add an entry.
 * 
 * @module components/visual-logger
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/visual-logger';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  classNames: ['visual-logger'],

  visualLogger: service(),
});
