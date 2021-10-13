/**
 * Contains various utils related to workflow lane runs.
 *
 * @module utils/workflow-visualiser/run-utils
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Number|'inAdvance'} AtmLaneRunNo
 */

/**
 * Special value, which should be used as a `runNo` for runs prepared in advance.
 * @type {String}
 */
export const inAdvanceRunNo = 'inAdvance';

/**
 * Converts runs registry (an object with runs as a values) to a sorted array of runs.
 * Runs are sorted in ascending order. If prepared in advance run exists, then
 * it is placed at the end of the array.
 * @param {Object<AtmLaneRunNo,{ runNo: AtmLaneRunNo }>} runsRegistry
 * @returns {Array<Object>}
 */
export function runsRegistryToSortedArray(runsRegistry) {
  const runsArr = Object.values(runsRegistry || {}).uniqBy('runNo');

  let runsArrWithoutRunInAdvance;
  const runInAdvance = runsArr.findBy('runNo', inAdvanceRunNo);
  runsArrWithoutRunInAdvance = runInAdvance ?
    runsArr.without(runInAdvance) : runsArr;

  const sortedRuns = runsArrWithoutRunInAdvance.sortBy('runNo');
  if (runInAdvance) {
    sortedRuns.push(runInAdvance);
  }
  return sortedRuns;
}
