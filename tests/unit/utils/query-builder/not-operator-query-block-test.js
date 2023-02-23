import { expect } from 'chai';
import { describe, it } from 'mocha';
import { get } from '@ember/object';
import NotOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/not-operator-query-block';

describe('Unit | Utility | query-builder/not-operator-query-block', function () {
  it('has "operator" equal to "not"', function () {
    const block = NotOperatorQueryBlock.create();
    expect(get(block, 'operator')).to.equal('not');
  });

  it('has "maxOperandsNumber" property set to 1', function () {
    expect(get(NotOperatorQueryBlock.create(), 'maxOperandsNumber'))
      .to.equal(1);
  });
});
