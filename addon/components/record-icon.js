/**
 * Shows record icon. To calculate proper icon, one of `record` or `modelName` properties
 * must be set. When both provided, `record` is used.
 *
 * To get a more detailed icon (e.g. icon dedicated for a specific group type)
 * you must pass `record` and set `useSubtypeIcon` to true.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import recordIcon from 'onedata-gui-common/utils/record-icon';
import Component from '@glimmer/component';

/**
 * @typedef {Object} RecordIconArgs
 * @param {boolean} [useSubtypeIcon=false]
 * @param {Object} [record]
 * @param {string} [modelName]
 */

/**
 * @type {Component<RecordIconArgs>}
 */
export default class RecordIconComponent extends Component {
  /**
   * @type {boolean}
   */
  get useSubtypeIcon() {
    return this.args.useSubtypeIcon ?? false;
  }

  /**
   * @type {Object}
   */
  get record() {
    return this.args.record;
  }

  /**
   * @type {string}
   */
  get modelName() {
    return this.args.modelName;
  }

  /**
   * @type {OneIconName}
   */
  @computed(
    'useSubtypeIcon',
    // observe record properties used by recordIcon util
    'record.{type,fileType,typeName}',
    'modelName',
  )
  get icon() {
    const {
      useSubtypeIcon,
      record,
      modelName,
    } = this;

    return recordIcon(record ?? modelName, useSubtypeIcon);
  }
}
