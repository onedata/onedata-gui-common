import { expect } from 'chai';
import { describe, it } from 'mocha';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import { get } from '@ember/object';

describe('Unit | Utility | workflow-visualiser/lane/parallel-box', function () {
  it('has "__modelType" equal to "parallelBox"', function () {
    const parallelBox = ParallelBox.create();

    expect(get(parallelBox, '__modelType')).to.equal('parallelBox');
  });

  it('has "renderer" equal to "workflow-visualiser/lane/parallel-box"', function () {
    const parallelBox = ParallelBox.create();

    expect(get(parallelBox, 'renderer'))
      .to.equal('workflow-visualiser/lane/parallel-box');
  });

  it('has an empty array "elements" on init', function () {
    const parallelBox = ParallelBox.create();

    expect(get(parallelBox, 'elements')).to.be.an('array').and.to.have.length(0);
  });
});
