import { expect } from 'chai';
import { describe, it } from 'mocha';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import { get } from '@ember/object';

describe('Unit | Utility | query builder/condition query block', function () {
  it(
    'has empty "property", "comparator" and "comparatorValue" fields on init',
    function () {
      const block = ConditionQueryBlock.create();
      expect(get(block, 'property')).to.be.null;
      expect(get(block, 'comparator')).to.be.null;
      expect(get(block, 'comparatorValue')).to.be.null;
    });

  it('has "renderer" set to "condition-block"', function () {
    expect(get(ConditionQueryBlock.create(), 'renderer')).to.equal('condition-block');
  });
});
