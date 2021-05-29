/**
 * Provides converters for type <-> data spec. Data specs are used to define type of
 * data accepted by lambda argument/result and stores.
 *
 * @module utils/workflow-visualiser/data-spec-converters
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

const typeForFileTypeFileType = {
  ANY: 'anyFile',
  REG: 'regularFile',
  DIR: 'directory',
};
const fileTypeFileTypeForType =
  _.invert(typeForFileTypeFileType);

const typeForStoreCredentialsTypeStoreType = {
  singleValue: 'singleValueStore',
  list: 'listStore',
  map: 'mapStore',
  treeForest: 'treeForestStore',
  range: 'rangeStore',
  histogram: 'histogramStore',
  auditLog: 'auditLogStore',
};
const storeCredentialsTypeStoreTypeForType =
  _.invert(typeForStoreCredentialsTypeStoreType);

export function dataSpecToType(dataSpec) {
  const valueConstraints = dataSpec.valueConstraints || {};
  switch (dataSpec.type) {
    case 'file':
      return typeForFileTypeFileType[valueConstraints.fileType];
    case 'storeCredentials':
      return typeForStoreCredentialsTypeStoreType[valueConstraints.storeType];
    default:
      return dataSpec.type;
  }
}

export function typeToDataSpec(type) {
  if (type in fileTypeFileTypeForType) {
    return {
      type: 'file',
      valueConstraints: {
        fileType: fileTypeFileTypeForType[type],
      },
    };
  } else if (type in storeCredentialsTypeStoreTypeForType) {
    return {
      type: 'storeCredentials',
      valueConstraints: {
        storeType: storeCredentialsTypeStoreTypeForType[type],
      },
    };
  } else {
    return {
      type,
      valueConstraints: {},
    };
  }
}
