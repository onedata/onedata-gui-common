/**
 * @module components/demo-components/query-builder
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  queryProperties: Object.freeze([{
      key: 'hello',
      type: 'string',
    },
    {
      key: 'world',
      type: 'number',
    },
  ]),
});
