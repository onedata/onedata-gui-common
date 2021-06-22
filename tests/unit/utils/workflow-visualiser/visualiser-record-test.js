import { expect } from 'chai';
import { describe, it } from 'mocha';
import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
import { get } from '@ember/object';
import sinon from 'sinon';

describe('Unit | Utility | workflow visualiser/visualiser record', function () {
  it('has undefined "name"', function () {
    const element = VisualiserRecord.create();

    expect(get(element, 'name')).to.be.undefined;
  });

  it('has undefined "status"', function () {
    const element = VisualiserRecord.create();

    expect(get(element, 'status')).to.be.undefined;
  });

  it('has false "isFirst" and "isLast" on init', function () {
    const lane = VisualiserRecord.create();

    expect(get(lane, 'isFirst')).to.be.false;
    expect(get(lane, 'isLast')).to.be.false;
  });

  it('calls "onModify" with element reference and modified props on "modify" call', function () {
    const spy = sinon.spy();
    const element = VisualiserRecord.create({
      onModify: spy,
    });
    const modifiedProps = Object.freeze({});

    element.modify(modifiedProps);

    expect(spy).to.be.calledOnce.and.to.be.calledWith(element, modifiedProps);
  });

  it('calls "onMove" with element reference and move step on "move" call', function () {
    const spy = sinon.spy();
    const element = VisualiserRecord.create({
      onMove: spy,
    });

    element.move(2);

    expect(spy).to.be.calledOnce.and.to.be.calledWith(element, 2);
  });

  it('calls "onRemove" with element reference on "remove" call', function () {
    const spy = sinon.spy();
    const element = VisualiserRecord.create({
      onRemove: spy,
    });

    element.remove();

    expect(spy).to.be.calledOnce.and.to.be.calledWith(element);
  });
});
