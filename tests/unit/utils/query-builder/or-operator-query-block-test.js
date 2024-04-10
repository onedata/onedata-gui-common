import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import { get } from '@ember/object';
import OrOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/or-operator-query-block';

describe('Unit | Utility | query-builder/or-operator-query-block', function () {
  afterEach(function () {
    this.block?.destroy();
  });

  it('has "operator" equal to "or"', function () {
    this.block = OrOperatorQueryBlock.create();
    expect(get(this.block, 'operator')).to.equal('or');
  });
});
