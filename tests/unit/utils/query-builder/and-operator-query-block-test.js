import { expect } from 'chai';
import { describe, it } from 'mocha';
import { get } from '@ember/object';
import AndOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/and-operator-query-block';

describe('Unit | Utility | query-builder/and-operator-query-block', function () {
  it('has "operator" equal to "and"', function () {
    const block = AndOperatorQueryBlock.create();
    expect(get(block, 'operator')).to.equal('and');
  });
});
