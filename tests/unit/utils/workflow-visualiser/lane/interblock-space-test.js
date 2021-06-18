import { expect } from 'chai';
import { describe, it } from 'mocha';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import ParalallelBlock from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/lane/interblock space', function () {
  it('has "__modelType" equal to "interblockSpace"', function () {
    const interblockSpace = InterblockSpace.create();

    expect(get(interblockSpace, '__modelType')).to.equal('interblockSpace');
  });

  it('has "renderer" equal to "workflow-visualiser/lane/interblock-space"', function () {
    const interblockSpace = InterblockSpace.create();

    expect(get(interblockSpace, 'renderer'))
      .to.equal('workflow-visualiser/lane/interblock-space');
  });

  it('has "siblingsType" equal to "parallelBox" when parent is a lane', function () {
    const interblockSpace = InterblockSpace.create({
      parent: Lane.create(),
    });

    expect(get(interblockSpace, 'siblingsType')).to.equal('parallelBox');
  });

  it('has "siblingsType" equal to "task" when parent is a parallel box', function () {
    const interblockSpace = InterblockSpace.create({
      parent: ParalallelBlock.create(),
    });

    expect(get(interblockSpace, 'siblingsType')).to.equal('task');
  });
});
