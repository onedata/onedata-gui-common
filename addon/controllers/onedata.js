/**
 * Defines actions that use routes for closure actions in route templates
 *
 * @module controllers/onedata
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  guiUtils: service(),
});
