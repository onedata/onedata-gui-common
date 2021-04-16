import { expect } from 'chai';
import { describe, it } from 'mocha';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import { get } from '@ember/object';
import sinon from 'sinon';

describe('Unit | Utility | workflow visualiser/lane', function () {
  it('has "renderer" equal to "workflow-visualiser/lane"', function () {
    const lane = Lane.create();

    expect(get(lane, 'renderer')).to.equal('workflow-visualiser/lane');
  });

  it('has "type" equal to "lane"', function () {
    const lane = Lane.create();

    expect(get(lane, 'type')).to.equal('lane');
  });

  it('has an empty array "elements" on init', function () {
    const lane = Lane.create();

    expect(get(lane, 'elements')).to.be.an('array').and.to.have.length(0);
  });

  it('calls "onClear" with element reference on "clear" call', function () {
    const spy = sinon.spy();
    const element = Lane.create({
      onClear: spy,
    });

    element.clear();

    expect(spy).to.be.calledOnce.and.to.be.calledWith(element);
  });
});
