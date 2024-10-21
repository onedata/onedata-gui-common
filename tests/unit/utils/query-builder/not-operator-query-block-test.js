import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import { get } from '@ember/object';
import NotOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/not-operator-query-block';

describe('Unit | Utility | query-builder/not-operator-query-block', function () {
  afterEach(function () {
    this.block?.destroy();
  });

  it('has "operator" equal to "not"', function () {
    this.block = NotOperatorQueryBlock.create();
    expect(get(this.block, 'operator')).to.equal('not');
  });

  it('has "maxOperandsNumber" property set to 1', function () {
    this.block = NotOperatorQueryBlock.create();
    expect(get(this.block, 'maxOperandsNumber')).to.equal(1);
  });
});
