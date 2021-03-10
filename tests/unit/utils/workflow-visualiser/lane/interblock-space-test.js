import { expect } from 'chai';
import { describe, it } from 'mocha';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import ParalallelBlock from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-block';
import { get } from '@ember/object';
import sinon from 'sinon';

describe('Unit | Utility | workflow visualiser/lane/interblock space', function () {
  it('has "renderer" equal to "workflow-visualiser/lane/interblock-space"', function () {
    const interblockSpace = InterblockSpace.create();

    expect(get(interblockSpace, 'renderer'))
      .to.equal('workflow-visualiser/lane/interblock-space');
  });

  it('has "type" equal to "interblockSpace"', function () {
    const interblockSpace = InterblockSpace.create();

    expect(get(interblockSpace, 'type')).to.equal('interblockSpace');
  });

  it('has "siblingsType" equal to "parallelBlock" when parent is a lane', function () {
    const interblockSpace = InterblockSpace.create({
      parent: Lane.create(),
    });

    expect(get(interblockSpace, 'siblingsType')).to.equal('parallelBlock');
  });

  it('has "siblingsType" equal to "task" when parent is a parallel block', function () {
    const interblockSpace = InterblockSpace.create({
      parent: ParalallelBlock.create(),
    });

    expect(get(interblockSpace, 'siblingsType')).to.equal('task');
  });

  it('calls "onAddLaneElement" with "parent" and "elementBefore" references on "addLaneElement" call', function () {
    const spy = sinon.spy();
    const elementBefore = VisualiserRecord.create();
    const parent = VisualiserRecord.create();
    const element = InterblockSpace.create({
      elementBefore,
      parent,
      onAddLaneElement: spy,
    });

    element.addLaneElement();

    expect(spy).to.be.calledOnce.and.to.be.calledWith(parent, elementBefore);
  });
});
