import { expect } from 'chai';
import { describe, it } from 'mocha';
import { get } from '@ember/object';
import OrOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/or-operator-query-block';

describe('Unit | Utility | query-builder/or-operator-query-block', function () {
  it('has "operator" equal to "or"', function () {
    const block = OrOperatorQueryBlock.create();
    expect(get(block, 'operator')).to.equal('or');
  });
});
