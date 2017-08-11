/**
 * Performs import of packaged managed by Browserify due to bug described here:
 * https://github.com/ef4/ember-browserify#the-workaround
 *
 * @module initializers/force-browserify-import
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import 'npm:perfect-scrollbar';
import 'npm:round10';

export default {
  name: 'force-browserify-import',

  initialize: function ( /* application */ ) {}
};
