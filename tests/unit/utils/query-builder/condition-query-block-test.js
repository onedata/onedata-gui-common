import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import { get } from '@ember/object';

describe('Unit | Utility | query-builder/condition-query-block', function () {
  afterEach(function () {
    this.block?.destroy();
  });

  it(
    'has empty "property", "comparator" and "comparatorValue" fields on init',
    function () {
      this.block = ConditionQueryBlock.create();
      expect(get(this.block, 'property')).to.be.null;
      expect(get(this.block, 'comparator')).to.be.null;
      expect(get(this.block, 'comparatorValue')).to.be.null;
    });

  it('has "renderer" set to "condition-block"', function () {
    this.block = ConditionQueryBlock.create();
    expect(get(this.block, 'renderer')).to.equal('condition-block');
  });
});
