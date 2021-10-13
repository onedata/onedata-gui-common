import { expect } from 'chai';
import { describe, it } from 'mocha';
import { runsRegistryToSortedArray, inAdvanceRunNo } from 'onedata-gui-common/utils/workflow-visualiser/run-utils';

describe('Unit | Utility | workflow visualiser/run utils', function () {
  describe('runsRegistryToSortedArray', function () {
    it('returns sorted array of runs for registry with normal runs only', function () {
      const sorterArr = runsRegistryToSortedArray({
        3: { runNo: 3 },
        10: { runNo: 10 },
        1: { runNo: 1 },
      });
      expect(sorterArr.mapBy('runNo')).to.deep.equal([1, 3, 10]);
    });

    it('returns sorted array of runs for registry with normal runs and in advance run', function () {
      const sorterArr = runsRegistryToSortedArray({
        3: { runNo: 3 },
        10: { runNo: 10 },
        inAdvance: { runNo: inAdvanceRunNo },
        1: { runNo: 1 },
      });
      expect(sorterArr.mapBy('runNo')).to.deep.equal([1, 3, 10, inAdvanceRunNo]);
    });

    it('returns empty array for empty registry', function () {
      const sorterArr = runsRegistryToSortedArray({});
      expect(sorterArr).to.deep.equal([]);
    });
  });
});
