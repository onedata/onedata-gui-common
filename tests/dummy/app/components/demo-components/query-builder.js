/**
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import RootOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import { A } from '@ember/array';

const stringOptionsProperty = {
  displayedKey: 'Some options',
  key: 'optionKey',
  type: 'stringOptions',
  stringValues: ['one', 'two', 'alpha'],
};

const numberOptionsProperty = {
  displayedKey: 'Number options',
  key: 'numberOptionKey',
  type: 'numberOptions',
  numberValues: [-1, 0, 1, 2, 3, 4, 5],
};

const mixedNumberOptions = [1, 2, 3, 4, 5];
const mixedStringOptions = [
  'Commodo mollit ut tempor ut irure tempor dolore veniam proident do aliquip amet culpa.',
  'Aliqua exercitation quis veniam id est.',
];

const mixedOptionsProperty = {
  displayedKey: 'Mixed options',
  key: 'mixedOptionKey',
  type: 'mixedOptions',
  numberValues: mixedNumberOptions,
  stringValues: mixedStringOptions,
  allValues: [...mixedNumberOptions, ...mixedStringOptions],
};

const stringProperty = {
  key: 'hello',
  displayedKey: 'Hello',
  type: 'string',
};

export default Component.extend({
  queryProperties: Object.freeze([
    stringProperty,
    numberOptionsProperty,
    stringOptionsProperty,
    mixedOptionsProperty,
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
  ]),

  // uncomment to mock initial data
  operands: computed(function operands() {
    // UNCOMMENT for number dropdown
    return A([ConditionQueryBlock.create({
      property: numberOptionsProperty,
      comparator: 'numberOptions.eq',
      comparatorValue: 1,
    })]);
    // UNCOMMENT for string dropdown
    // return A([ConditionQueryBlock.create({
    //   property: stringOptionsProperty,
    //   comparator: 'stringOptions.eq',
    //   comparatorValue: 'two',
    // })]);
    // UNCOMMENT for text editor
    // return A([ConditionQueryBlock.create({
    //   property: stringProperty,
    //   comparator: 'string.eq',
    //   comparatorValue: 'test',
    // })]);
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
