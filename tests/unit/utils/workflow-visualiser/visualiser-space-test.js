import { expect } from 'chai';
import { describe, it } from 'mocha';
import VisualiserSpace from 'onedata-gui-common/utils/workflow-visualiser/visualiser-space';
import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
import { get } from '@ember/object';
import sinon from 'sinon';

describe('Unit | Utility | workflow-visualiser/visualiser-space', function () {
  it('has undefined "elementBefore" and "elementAfter" on init', function () {
    const interlaneSpace = VisualiserSpace.create();

    expect(get(interlaneSpace, 'elementBefore')).to.be.undefined;
    expect(get(interlaneSpace, 'elementAfter')).to.be.undefined;
  });

  it('has non-empty "id" on init', function () {
    const interlaneSpace = VisualiserSpace.create();

    expect(get(interlaneSpace, 'id')).to.be.not.empty;
  });

  it(
    'calls "onAddElement" with "parent", "elementBefore" references and new element properties on "addElement" call',
    function () {
      const spy = sinon.spy();
      const elementBefore = VisualiserRecord.create();
      const parent = VisualiserRecord.create();
      const element = VisualiserSpace.create({
        elementBefore,
        parent,
        onAddElement: spy,
      });
      const newElementProps = {};

      element.addElement(newElementProps);

      expect(spy).to.be.calledOnce
        .and.to.be.calledWith(parent, elementBefore, newElementProps);
    }
  );

  it(
    'calls "onDragDropElement" with "parent", "elementBefore" references and dropped element on "dragDropElement" call',
    function () {
      const spy = sinon.spy();
      const elementBefore = VisualiserRecord.create();
      const parent = VisualiserRecord.create();
      const element = VisualiserSpace.create({
        elementBefore,
        parent,
        onDragDropElement: spy,
      });
      const droppedElement = VisualiserRecord.create();

      element.dragDropElement(droppedElement);

      expect(spy).to.be.calledOnce
        .and.to.be.calledWith(parent, elementBefore, droppedElement);
    }
  );
});
