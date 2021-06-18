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
  },
  storeCredentials: {
    singleValue: 'singleValueStore',
    list: 'listStore',
    map: 'mapStore',
    treeForest: 'treeForestStore',
    range: 'rangeStore',
    histogram: 'histogramStore',
    auditLog: 'auditLogStore',
  },
};

// `dataSpecConstraintsToTypeMapping` with inverted mappings per each dataSpec type
const typeToDataSpecConstraintsMapping =
  Object.keys(dataSpecConstraintsToTypeMapping).reduce((mapping, dataSpecType) => {
    mapping[dataSpecType] = _.invert(dataSpecConstraintsToTypeMapping[dataSpecType]);
    return mapping;
  }, {});

export function dataSpecToType(dataSpec) {
  const valueConstraints = dataSpec.valueConstraints || {};
  switch (dataSpec.type) {
    case 'file':
      return dataSpecConstraintsToTypeMapping
        .file[valueConstraints.fileType];
    case 'storeCredentials':
      return dataSpecConstraintsToTypeMapping
        .storeCredentials[valueConstraints.storeType];
    default:
      return dataSpec.type;
  }
}

export function typeToDataSpec(type) {
  if (type in typeToDataSpecConstraintsMapping.file) {
    return {
      type: 'file',
      valueConstraints: {
        fileType: typeToDataSpecConstraintsMapping.file[type],
      },
    };
  } else if (type in typeToDataSpecConstraintsMapping.storeCredentials) {
    return {
      type: 'storeCredentials',
      valueConstraints: {
        storeType: typeToDataSpecConstraintsMapping.storeCredentials[type],
      },
    };
  } else {
    return {
      type,
      valueConstraints: {},
    };
  }
}
