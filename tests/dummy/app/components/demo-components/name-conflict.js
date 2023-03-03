/**
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  // fake names
  nonConflictName: Object.freeze({
    name: 'someName',
  }),

  conflictName: Object.freeze({
    name: 'someName',
    conflictLabel: 'conflictLabel',
  }),
});
