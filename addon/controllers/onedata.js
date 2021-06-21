/**
 * Defines actions that use routes for closure actions in route templates
 *
 * @module controllers/onedata
 * @author Jakub Liput
 * @copyright (C) 2017-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import AspectOptionsHandler from 'onedata-gui-common/mixins/controllers/aspect-options-handler';

export default Controller.extend(AspectOptionsHandler, {
  queryParams: ['options'],
});
