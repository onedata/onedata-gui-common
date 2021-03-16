/**
 * Returns icon name for a record or model name.
 *
 * To get a more detailed icon (e.g. icon dedicated for a specific group type)
 * you must pass record object and set `useSubtypeIcon` argument to true.
 *
 * Icon mappings are also exported to allow global, per-project custom modifications
 * of these objects.
 *
 * TODO: add more icons when used in projects other than onezone-gui.
 *
 * @module utils/record-icon
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 */

import { get } from '@ember/object';
import { camelize } from '@ember/string';

export default function recordIcon(recordOrModelName, useSubtypeIcon = false) {
  let modelName, record;
  if (!recordOrModelName) {
    return;
  } else if (typeof recordOrModelName === 'string') {
    modelName = recordOrModelName;
  } else {
    record = recordOrModelName;
    modelName = get(record, 'constructor.modelName');
  }

  if (!modelName) {
    return;
  }

  if (useSubtypeIcon && subtypeIconGetters[modelName] && record) {
    const subtypeIcon = subtypeIconGetters[modelName](record);
    if (subtypeIcon) {
      return subtypeIcon;
    }
  }

  return modelToIconMapping[camelize(modelName)];
}

export const modelToIconMapping = {
  harvester: 'light-bulb',
  share: 'browser-share',
  token: 'tokens',
};
[
  'cluster',
  'group',
  'provider',
  'space',
  'user',
].forEach(modelName => modelToIconMapping[modelName] = modelName);

export const subtypeIconGetters = {
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
