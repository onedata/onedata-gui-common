import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import { get } from '@ember/object';
import AndOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/and-operator-query-block';

describe('Unit | Utility | query-builder/and-operator-query-block', function () {
  afterEach(function () {
    this.block?.destroy();
  });

  it('has "operator" equal to "and"', function () {
    this.block = AndOperatorQueryBlock.create();
    expect(get(this.block, 'operator')).to.equal('and');
  });
});
