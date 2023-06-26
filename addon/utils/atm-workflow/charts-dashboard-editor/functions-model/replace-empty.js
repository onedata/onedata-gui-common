/**
 * Model of `replaceEmpty` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { ReplaceEmptyStrategy } from 'onedata-gui-common/utils/time-series-dashboard';
import { FunctionDataType } from './common';
import FunctionBase from './function-base';

const dataArgument = Object.freeze({
  name: 'data',
  compatibleTypes: [FunctionDataType.Points, FunctionDataType.Number],
});

const ReplaceEmptyFunction = FunctionBase.extend({
  /**
   * @public
   * @type {FunctionBase | null}
   */
  data: null,

  /**
   * @public
   * @type {ReplaceEmptyStrategy}
   */
  strategy: ReplaceEmptyStrategy.UseFallback,

  /**
   * @public
   * @type {number | null}
   */
  fallbackValue: 0,

  /**
   * @override
   */
  name: 'replaceEmpty',

  /**
   * @override
   */
  hasSettingsComponent: true,

  /**
   * @override
   */
  attachableArgumentSpecs: Object.freeze([dataArgument]),

  /**
   * @override
   */
  returnedTypes: computed('data.returnedTypes', function returnedTypes() {
    return this.data?.returnedTypes ?? dataArgument.compatibleTypes;
  }),
});

/**
 * @type {FunctionSpec<ReplaceEmptyFunction>}
 */
export default Object.freeze({
  name: 'replaceEmpty',
  returnedTypes: [FunctionDataType.Points, FunctionDataType.Number],
  modelClass: ReplaceEmptyFunction,
});
