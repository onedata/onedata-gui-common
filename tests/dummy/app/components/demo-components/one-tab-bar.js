/**
 * @module components/demo-components/one-tab-bar
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
  items: Object.freeze(_.range(1, 100).map(i => ({
    text: 'Oneprovider ' + i,
    icon: 'provider',
  }))),
});
