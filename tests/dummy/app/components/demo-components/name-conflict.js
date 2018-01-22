/**
 * @module components/demo-components/name-conflict
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  // fake names
  nonConflictName: {
    name: 'someName',
  },

  conflictName: {
    name: 'someName',
    conflictLabel: 'conflictLabel',
  },
});
