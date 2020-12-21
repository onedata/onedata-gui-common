/**
 * @module components/demo-components/query-builder
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import RootOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/root-operator-query-block';

export default Component.extend({
  queryProperties: Object.freeze([{
      key: 'hello',
      displayedKey: 'Hello',
      type: 'string',
    },
    {
      displayedKey: 'World',
      key: 'world',
      type: 'number',
    }, {
      displayedKey: 'Zeta',
      isSpecialKey: true,
      key: 'zeta',
      type: 'number',
    },
    {
      displayedKey: 'Some options',
      key: 'optionKey',
      type: 'stringOptions',
      stringValues: ['one', 'two', 'alpha'],
    },
  ]),

  rootQueryBlock: computed(function rootQueryBlock() {
    return RootOperatorQueryBlock.create({
      notifyUpdate: this.notifyUpdate.bind(this),
    });
  }),

  notifyUpdate(block) {
    console.log('block updated');
    console.dir(block);
  },
});
