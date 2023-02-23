import { expect } from 'chai';
import { describe, it } from 'mocha';
import OperatorQueryBlock from 'onedata-gui-common/utils/query-builder/operator-query-block';
import { get } from '@ember/object';

describe('Unit | Utility | query-builder/operator-query-block', function () {
  it('has empty "operator" and "operands" fields on init', function () {
    const block = OperatorQueryBlock.create();
    expect(get(block, 'operator')).to.be.null;
    expect(get(block, 'operands')).to.be.an('array').with.length(0);
  });

  it('sets "operator" field according to the value passed while creation', function () {
    const block = OperatorQueryBlock.create({
      operator: 'and',
    });
    expect(block.operator).to.equal('and');
  });

  it('has "renderer" property set to "operator-block"', function () {
    expect(get(OperatorQueryBlock.create(), 'renderer')).to.equal('operator-block');
  });

  it('has "maxOperandsNumber" property set to max integer', function () {
    expect(get(OperatorQueryBlock.create(), 'maxOperandsNumber'))
      .to.equal(Number.MAX_SAFE_INTEGER);
  });
});
