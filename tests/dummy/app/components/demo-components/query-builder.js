/**
 * @module components/demo-components/query-builder
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import RootOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import { A } from '@ember/array';

const optionsProperty = {
  displayedKey: 'Some options',
  key: 'optionKey',
  type: 'stringOptions',
  stringValues: ['one', 'two', 'alpha'],
};

const stringProperty = {
  key: 'hello',
  displayedKey: 'Hello',
  type: 'string',
};

export default Component.extend({
  queryProperties: Object.freeze([
    stringProperty,
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
    optionsProperty,
  ]),

  // uncomment to mock initial data
  operands: computed(function operands() {
    // UNCOMMENT for dropdown
    // return A([ConditionQueryBlock.create({
    //   property: optionsProperty,
    //   comparator: 'stringOptions.eq',
    //   comparatorValue: 'two',
    // })]);
    // UNCOMMENT for text editor
    return A([ConditionQueryBlock.create({
      property: stringProperty,
      comparator: 'string.eq',
      comparatorValue: 'test',
    })]);
    // UNCOMMENT for empty query
    // return A();
  }),

  rootQueryBlock: computed(function rootQueryBlock() {
    return RootOperatorQueryBlock.create({
      operands: this.get('operands') || A(),
      notifyUpdate: this.notifyUpdate.bind(this),
    });
  }),

  notifyUpdate(block) {
    console.log('block updated');
    console.dir(block);
  },
});
