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

const dataSpecConstraintsToTypeMapping = {
  file: {
    ANY: 'anyFile',
    REG: 'regularFile',
    DIR: 'directory',
    SYMLNK: 'symlink',
  },
  // TODO: VFS-7816 uncomment or remove future code
  // storeCredentials: {
  //   singleValue: 'singleValueStore',
  //   list: 'listStore',
  //   treeForest: 'treeForestStore',
  //   range: 'rangeStore',
  //   map: 'mapStore',
  //   histogram: 'histogramStore',
  //   auditLog: 'auditLogStore',
  // },
};

// `dataSpecConstraintsToTypeMapping` with inverted mappings per each dataSpec type
const typeToDataSpecConstraintsMapping =
  Object.keys(dataSpecConstraintsToTypeMapping).reduce((mapping, dataSpecType) => {
    mapping[dataSpecType] = _.invert(dataSpecConstraintsToTypeMapping[dataSpecType]);
    return mapping;
  }, {});

export function dataSpecToType(dataSpec) {
  const valueConstraints = dataSpec.valueConstraints || {};
  let isArray = false;
  let type = dataSpec.type;
  switch (dataSpec.type) {
    case 'array':
      isArray = true;
      type = dataSpecToType(valueConstraints.itemDataSpec).type;
      break;
    case 'file':
      type = dataSpecConstraintsToTypeMapping
        .file[valueConstraints.fileType];
      // TODO: VFS-7816 uncomment or remove future code
      // case 'storeCredentials':
      //   return dataSpecConstraintsToTypeMapping
      //     .storeCredentials[valueConstraints.storeType];
  }
  return { type, isArray };
}

export function typeToDataSpec({ type, isArray }) {
  let dataSpec;
  if (type in typeToDataSpecConstraintsMapping.file) {
    dataSpec = {
      type: 'file',
      valueConstraints: {
        fileType: typeToDataSpecConstraintsMapping.file[type],
      },
    };
    // TODO: VFS-7816 uncomment or remove future code
    // } else if (type in typeToDataSpecConstraintsMapping.storeCredentials) {
    //   return {
    //     type: 'storeCredentials',
    //     valueConstraints: {
    //       storeType: typeToDataSpecConstraintsMapping.storeCredentials[type],
    //     },
    //   };
  } else {
    dataSpec = {
      type,
      valueConstraints: {},
    };
  }
  return isArray ? {
    type: 'array',
    valueConstraints: {
      itemDataSpec: dataSpec,
    },
  } : dataSpec;
}

export function getTargetStoreTypesForType(type, isBatch) {
  const targetTypes = ['list', 'auditLog'];
  if (!isBatch) {
    targetTypes.push('singleValue');
    if (type === 'range') {
      targetTypes.push('range');
    }
  }
  if (
    ['anyFile', 'regularFile', 'directory', 'symlink', 'dataset'].includes(type)
  ) {
    targetTypes.push('treeForest');
  }
  return targetTypes;
}

export function getTargetDataTypesForType(type) {
  const targetTypes = [type];
  switch (type) {
    // TODO: VFS-7816 uncomment or remove future code
    // case 'archive':
    case 'anyFile':
    case 'dataset':
    case 'range':
      targetTypes.push('object');
      break;
    case 'regularFile':
    case 'directory':
    case 'symlink':
      targetTypes.push('anyFile', 'object');
      break;
  }
  return targetTypes;
}

/**
 * @param {{ type, config }} storeProperties
 * @returns {AtmDataSpec|null} null when writing to store is not constrained by
 * data specs mechanism
 */
export function getStoreWriteDataSpec({ type, config }) {
  switch (type) {
    case 'auditLog':
      return config && config.logContentDataSpec || null;
    case 'list':
    case 'singleValue':
    case 'treeForest':
      return config && config.itemDataSpec || null;
    case 'range':
      return { type: 'range', valueConstraints: {} };
    default:
      return null;
  }
}

/**
 * @param {{ type, config }} storeProperties
 * @returns {AtmDataSpec|null} null when reading from store is not constrained by
 * data specs mechanism
 */
export function getStoreReadDataSpec({ type, config }) {
  switch (type) {
    case 'auditLog':
      return { type: 'object', valueConstraints: {} };
    case 'list':
    case 'singleValue':
    case 'treeForest':
      return config && config.itemDataSpec || null;
    case 'range':
      return { type: 'range', valueConstraints: {} };
    default:
      return null;
  }
}
