/**
 * Shows record icon. To calculate proper icon, one of `record` or `modelName` properties
 * must be set.
 * 
 * To get a more detailed icon (e.g. icon dedicated for a specific group type)
 * you must pass `record` and set `useSubtypeIcon` to true.
 * 
 * TODO: add more icons when used in projects other that onezone-gui.
 *
 * @module components/record-icon
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/record-icon';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { camelize } from '@ember/string';

const modelToIconMapping = {
  harvester: 'light-bulb',
  share: 'browser-share',
  sharedUser: 'user',
  token: 'tokens',
};
[
  'cluster',
  'group',
  'provider',
  'space',
  'user',
].forEach(modelName => modelToIconMapping[modelName] = modelName);

const subtypeIconGetters = {
  cluster: cluster => {
    const type = get(cluster || {}, 'type');
    switch (type) {
      case 'oneprovider':
        return 'provider';
      case 'onezone':
        return 'onezone';
      default:
        return undefined;
    }
  },
  group: group => {
    const type = get(group || {}, 'type');
    switch (type) {
      case 'organization':
      case 'unit':
      case 'team':
        return type;
      case 'role_holders':
        return 'role-holders';
      default:
        return undefined;
    }
  },
  share: share => {
    const fileType = get(share || {}, 'fileType');
    switch (fileType) {
      case 'file':
        return 'browser-file';
      case 'dir':
      case 'directory':
        return 'browser-directory';
      default:
        return undefined;
    }
  },
  token: token => {
    const typeName = get(token || {}, 'typeName');
    switch (typeName) {
      case 'access':
      case 'identity':
      case 'invite':
        return `token-${typeName}`;
      default:
        return undefined;
    }
  },
};

export default Component.extend({
  layout,
  tagName: 'span',
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
   * @type {ComputedProperty<String>}
   */
  modelName: reads('record.constructor.modelName'),

  /**
   * @virtual optional
   * @type {String}
   */
  color: undefined,

  /**
   * @type {Object}
   */
  modelToIconMapping,

  /**
   * @type {Object}
   */
  subtypeIconGetters,

  /**
   * @type {ComputedProperty<String>}
   */
  iconName: computed(
    'useSubtypeIcon',
    'record',
    'modelName',
    'modelToIconMapping',
    'subtypeIconGetters',
    function iconName() {
      const {
        useSubtypeIcon,
        record,
        modelName,
        modelToIconMapping,
        subtypeIconGetters,
      } = this.getProperties(
        'useSubtypeIcon',
        'record',
        'modelName',
        'modelToIconMapping',
        'subtypeIconGetters'
      );

      if (!modelName) {
        return;
      }

      if (useSubtypeIcon && subtypeIconGetters[modelName]) {
        const subtypeIcon = subtypeIconGetters[modelName](record);
        if (subtypeIcon) {
          return subtypeIcon;
        }
      }

      return modelToIconMapping[camelize(modelName)];
    }
  ),
});
