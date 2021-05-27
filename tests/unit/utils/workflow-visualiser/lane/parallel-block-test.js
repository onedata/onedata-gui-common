import { expect } from 'chai';
import { describe, it } from 'mocha';
import ParallelBlock from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-block';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/lane/parallel block', function () {
  it('has "__type" equal to "parallelBlock"', function () {
    const parallelBlock = ParallelBlock.create();

    expect(get(parallelBlock, '__type')).to.equal('parallelBlock');
  });

  it('has "renderer" equal to "workflow-visualiser/lane/parallel-block"', function () {
    const parallelBlock = ParallelBlock.create();

    expect(get(parallelBlock, 'renderer'))
      .to.equal('workflow-visualiser/lane/parallel-block');
  });

  it('has an empty array "elements" on init', function () {
    const parallelBlock = ParallelBlock.create();

    expect(get(parallelBlock, 'elements')).to.be.an('array').and.to.have.length(0);
  });
});
