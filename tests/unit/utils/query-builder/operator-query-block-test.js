import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import OperatorQueryBlock from 'onedata-gui-common/utils/query-builder/operator-query-block';
import { get } from '@ember/object';

describe('Unit | Utility | query-builder/operator-query-block', function () {
  afterEach(function () {
    this.block?.destroy();
  });

  it('has empty "operator" and "operands" fields on init', function () {
    this.block = OperatorQueryBlock.create();
    expect(get(this.block, 'operator')).to.be.null;
    expect(get(this.block, 'operands')).to.be.an('array').with.length(0);
  });

  it('sets "operator" field according to the value passed while creation', function () {
    this.block = OperatorQueryBlock.create({
      operator: 'and',
    });
    expect(this.block.operator).to.equal('and');
  });

  it('has "renderer" property set to "operator-block"', function () {
    this.block = OperatorQueryBlock.create();
    expect(get(this.block, 'renderer')).to.equal('operator-block');
  });

  it('has "maxOperandsNumber" property set to max integer', function () {
    this.block = OperatorQueryBlock.create();
    expect(get(this.block, 'maxOperandsNumber'))
      .to.equal(Number.MAX_SAFE_INTEGER);
  });
});
