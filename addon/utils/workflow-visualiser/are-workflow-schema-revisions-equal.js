/**
 * Checks if two provided workflow schema revisions have equal properties.
 * It cannot be done via simple _.isEqual, because some notations are equivalent
 * but different in JavaScript object - like null and undefined etc.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

export default function areWorkflowSchemaRevisionsEqual(revision1, revision2) {
  if (!revision1 || !revision2) {
    return false;
  }

  return checkEqualityPerEachKey(revision1, revision2, (key, val1, val2) => {
    switch (key) {
      case 'lanes':
        return areLaneListsEqual(val1, val2);
      case 'stores':
        return areStoreListsEqual(val1, val2);
      default:
        return _.isEqual(val1, val2);
    }
  });
}

function areLaneListsEqual(lanesList1, lanesList2) {
  return checkEqualityOfArrays(lanesList1, lanesList2, null, areLanesEqual);
}

function areLanesEqual(lane1, lane2) {
  return checkEqualityPerEachKey(lane1, lane2, (key, val1, val2) => {
    switch (key) {
      case 'parallelBoxes':
        return areParallelBoxListsEqual(val1, val2);
      default:
        return _.isEqual(val1, val2);
    }
  });
}

function areParallelBoxListsEqual(pboxList1, pboxList2) {
  return checkEqualityOfArrays(pboxList1, pboxList2, null, areParallelBoxesEqual);
}

function areParallelBoxesEqual(pbox1, pbox2) {
  return checkEqualityPerEachKey(pbox1, pbox2, (key, val1, val2) => {
    switch (key) {
      case 'tasks':
        return areTaskListsEqual(val1, val2);
      default:
        return _.isEqual(val1, val2);
    }
  });
}

function areTaskListsEqual(taskList1, taskList2) {
  return checkEqualityOfArrays(taskList1, taskList2, null, areTasksEqual);
}

function areTasksEqual(task1, task2) {
  return checkEqualityPerEachKey(task1, task2, (key, val1, val2) => {
    switch (key) {
      case 'argumentMappings':
        return checkEqualityOfArrays(val1, val2, 'argumentName', areArgumentMappingsEqual);
      case 'resultMappings':
        return checkEqualityOfArrays(val1, val2, 'resultName', areResultMappingsEqual);
      case 'resourceSpecOverride':
      case 'timeSeriesStoreConfig':
        return (isNone(val1) && isNone(val2)) || _.isEqual(val1, val2);
      default:
        return _.isEqual(val1, val2);
    }
  });
}

function areArgumentMappingsEqual(mapping1, mapping2) {
  return checkEqualityPerEachKey(mapping1, mapping2, (key, val1, val2) => {
    switch (key) {
      case 'valueBuilder':
        return areValueBuildersEqual(val1, val2);
      default:
        return _.isEqual(val1, val2);
    }
  });
}

function areValueBuildersEqual(builder1, builder2) {
  return checkEqualityPerEachKey(builder1, builder2, (key, val1, val2) => {
    switch (key) {
      case 'valueBuilderRecipe':
        return (isNone(val1) && isNone(val2)) || _.isEqual(val1, val2);
      default:
        return _.isEqual(val1, val2);
    }
  });
}

function areResultMappingsEqual(mapping1, mapping2) {
  return checkEqualityPerEachKey(mapping1, mapping2, (key, val1, val2) => {
    switch (key) {
      case 'storeContentUpdateOptions': {
        const isVal1Empty = isStoreContentUpdateOptionsEmpty(val1);
        const isVal2Empty = isStoreContentUpdateOptionsEmpty(val2);
        return (isVal1Empty && isVal2Empty) || _.isEqual(val1, val2);
      }
      default:
        return _.isEqual(val1, val2);
    }
  });
}

function isStoreContentUpdateOptionsEmpty(storeContentUpdateOptions) {
  if (isNone(storeContentUpdateOptions)) {
    return true;
  } else if (typeof storeContentUpdateOptions !== 'object') {
    return false;
  } else {
    const keys = Object.keys(storeContentUpdateOptions);
    return keys.length === 0 || keys.length === 1 && keys[0] === 'type';
  }
}

function areStoreListsEqual(storesList1, storesList2) {
  return checkEqualityOfArrays(storesList1, storesList2, 'id', areStoresEqual);
}

function areStoresEqual(store1, store2) {
  return checkEqualityPerEachKey(store1, store2, (key, val1, val2) => {
    switch (key) {
      case 'config':
        return areStoreConfigsEqual(val1, val2);
      case 'defaultInitialContent':
        if ((!isNone(val1) || !isNone(val2)) && !_.isEqual(val1, val2)) {
          if (store1.type === 'range') {
            if (!areRangeStoreDefaultValuesEqual(val1, val2)) {
              return false;
            }
          } else if (!_.isEqual(val1, val2)) {
            return false;
          }
        }
        return true;
      default:
        return _.isEqual(val1, val2);
    }
  });
}

function areStoreConfigsEqual(config1, config2) {
  if (_.isEmpty(config1) && _.isEmpty(config2)) {
    return true;
  }
  return checkEqualityPerEachKey(config1, config2, (key, val1, val2) =>
    _.isEqual(val1, val2)
  );
}

function areRangeStoreDefaultValuesEqual(default1, default2) {
  return checkEqualityPerEachKey(default1, default2, (key, val1, val2) => {
    switch (key) {
      case 'start':
        return (val1 || 0) === (val2 || 0);
      case 'step':
        return (val1 || 1) === (val2 || 1);
      default:
        return _.isEqual(val1, val2);
    }
  });
}

function isNone(val) {
  return val === null || val === undefined;
}

function isNoneOrEmptyArray(val) {
  return isNone(val) || (Array.isArray(val) && val.length === 0);
}

function checkEqualityPerEachKey(obj1, obj2, checker) {
  if (!obj1 || !obj2) {
    return false;
  }

  const keys = _.uniq([...Object.keys(obj1), ...Object.keys(obj2)]);
  for (const key of keys) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    if (!checker(key, val1, val2)) {
      return false;
    }
  }
  return true;
}

function checkEqualityOfArrays(arr1, arr2, sortKey, checkElementsEqualFun) {
  if (isNoneOrEmptyArray(arr1) && isNoneOrEmptyArray(arr2)) {
    return true;
  }
  let normalizedArr1 = arr1 || [];
  let normalizedArr2 = arr2 || [];
  if (sortKey) {
    normalizedArr1 = _.sortBy(normalizedArr1, [sortKey]);
    normalizedArr2 = _.sortBy(normalizedArr2, [sortKey]);
  }

  if (normalizedArr1.length !== normalizedArr2.length) {
    return false;
  }

  for (let i = 0; i < normalizedArr1.length; i++) {
    if (!checkElementsEqualFun(normalizedArr1[i], normalizedArr2[i])) {
      return false;
    }
  }
  return true;
}
