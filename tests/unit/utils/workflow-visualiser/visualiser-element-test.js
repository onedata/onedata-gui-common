import { expect } from 'chai';
import { describe, it } from 'mocha';
import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { get } from '@ember/object';

describe('Unit | Utility | workflow visualiser/visualiser element', function () {
  it('has undefined "renderer"', function () {
    const element = VisualiserElement.create();

    expect(get(element, 'renderer')).to.be.undefined;
  });

  it('has undefined "mode"', function () {
    const element = VisualiserElement.create();

    expect(get(element, 'mode')).to.be.undefined;
  });

  it('has undefined "type"', function () {
    const element = VisualiserElement.create();

    expect(get(element, 'type')).to.be.undefined;
  });

  it('has undefined "id"', function () {
    const element = VisualiserElement.create();

    expect(get(element, 'id')).to.be.undefined;
  });
});
