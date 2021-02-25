import { expect } from 'chai';
import { describe, it } from 'mocha';
import LaneElement from 'onedata-gui-common/utils/workflow-visualiser/lane/lane-element';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/lane/lane element', function () {
  it('has undefined "renderer"', function () {
    const element = LaneElement.create();

    expect(get(element, 'renderer')).to.be.undefined;
  });

  it('has undefined "mode"', function () {
    const element = LaneElement.create();

    expect(get(element, 'mode')).to.be.undefined;
  });

  it('has undefined "type"', function () {
    const element = LaneElement.create();

    expect(get(element, 'type')).to.be.undefined;
  });

  it('has undefined "id"', function () {
    const element = LaneElement.create();

    expect(get(element, 'id')).to.be.undefined;
  });

  it('has undefined "parent"', function () {
    const element = LaneElement.create();

    expect(get(element, 'parent')).to.be.undefined;
  });
});
