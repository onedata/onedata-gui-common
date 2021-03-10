import { expect } from 'chai';
import { describe, it } from 'mocha';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
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

  it(
    'calls "onDropLaneElement" with "parent", "elementBefore" and dropped element references on "dropLaneElement" call',
    function () {
      const spy = sinon.spy();
      const elementBefore = VisualiserRecord.create();
      const parent = VisualiserRecord.create();
      const element = InterblockSpace.create({
        elementBefore,
        parent,
        onDropLaneElement: spy,
      });
      const droppedElement = VisualiserRecord.create();

      element.dropLaneElement(droppedElement);

      expect(spy).to.be.calledOnce
        .and.to.be.calledWith(parent, elementBefore, droppedElement);
    }
  );
});
