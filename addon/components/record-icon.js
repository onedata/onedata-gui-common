/**
 * Shows record icon. To calculate proper icon, one of `record` or `modelName` properties
 * must be set. When both provided, `record` is used.
 *
 * To get a more detailed icon (e.g. icon dedicated for a specific group type)
 * you must pass `record` and set `useSubtypeIcon` to true.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import recordIcon from 'onedata-gui-common/utils/record-icon';
import OneIcon from 'onedata-gui-common/components/one-icon';

export default OneIcon.extend({
  classNames: ['record-icon'],

  /**
   * @virtual optional
   * @type {boolean}
   */
  useSubtypeIcon: false,

  /**
   * @virtual optional
   * @type {Object}
   */
  record: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  modelName: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  icon: computed(
    'useSubtypeIcon',
    'record',
    'modelName',
    function iconName() {
      const {
        useSubtypeIcon,
        record,
        modelName,
      } = this.getProperties(
        'useSubtypeIcon',
        'record',
        'modelName'
      );

      return recordIcon(record || modelName, useSubtypeIcon);
    }
  ),
});
